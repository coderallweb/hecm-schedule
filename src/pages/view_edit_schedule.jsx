/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  ArrowLeft,
  FileDown,
  Loader
} from "lucide-react";
import {
  filiereService,
  niveauService,
  coursService
} from "../services/supabaseService";
import { useAuth } from "../contexts/AuthContext";

const EditSchedule = () => {
  const { filiereId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [filiere, setFiliere] = useState(null);
  const [niveaux, setNiveaux] = useState([]);
  const [sameMdayToFday, setSameMdayToFday] = useState(false);
  const [tousCours, setTousCours] = useState([]);
  const [niveauActif, setNiveauActif] = useState("L1");
  const [jourActif, setJourActif] = useState("lundi");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCours, setEditingCours] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [IsSubmitting, setIsSubmitting] = useState(false);

  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  const typesCours = ["Cours", "TD", "TP", "Projet", "Séminaire", "Recherche", "Encadrement", "Suivi"];

  useEffect(() => {
    loadData();
  }, [filiereId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [filiereData, niveauxData, coursData] = await Promise.all([
        filiereService.getById(filiereId),
        niveauService.getAll(),
        coursService.getByFiliere(filiereId)
      ]);

      setFiliere(filiereData);
      setNiveaux(niveauxData);
      setTousCours(coursData);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      alert("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les cours côté client
  const getCoursActuels = () => {
    return tousCours.filter(cours =>
      cours.niveau?.code === niveauActif &&
      cours.jour === jourActif
    ).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
  };


  const handleAddCours = () => {
    setIsSubmitting(false);
    const niveauObj = niveaux.find(n => n.code === niveauActif);
    setEditingCours({
      filiere_id: filiereId,
      niveau_id: niveauObj?.id,
      matiere: "",
      code_matiere: "",
      jour: jourActif,
      heure_debut: "08:00",
      heure_fin: "10:00",
      professeur: "",
      salle: "",
      type_cours: "Cours"
    });
    setIsEditMode(true);
  };

  const handleEditCours = (coursItem) => {
    setEditingCours({ ...coursItem });
    setIsEditMode(true);
  };

  const handleSaveCours = async () => {
    
    // 1. Validations de surface (Instantané)
    if (!editingCours.matiere || !editingCours.heure_debut || !editingCours.heure_fin) {
      alert("Veuillez remplir tous les champs obligatoires (Matière, Début, Fin).");
      return;
    }

    if (editingCours.heure_debut >= editingCours.heure_fin) {
      alert("L'heure de début doit être strictement inférieure à l'heure de fin.");
      return;
    }

    // 2. Moteur de vérification de conflits centralisé
    const validateSchedule = async (coursData, targetDay, excludeId = null) => {
      const { salle, professeur, heure_debut, heure_fin } = coursData;

      try {
        // A. Conflit de Salle (Chevauchement)
        const isSallePrise = await coursService.checkSalleConflict(salle, targetDay, heure_debut, heure_fin, excludeId);
        if (isSallePrise) {
          const confirmForce = confirm(`La salle "${salle}" est déjà occupée sur ce créneau le ${targetDay}. Voulez-vous forcer l'ajout ?`);
          if (!confirmForce) return { valid: false };
        }

        // B. Conflit de Professeur (Chevauchement) - Souvent bloquant
        const isProfOccupe = await coursService.checkProfesseurConflict(professeur, targetDay, heure_debut, heure_fin, excludeId);
        if (isProfOccupe) {
          alert(`Impossible : Le professeur ${professeur} a déjà un autre cours prévu le ${targetDay} à cette heure.`);
          return { valid: false };
        }

        // C. Conflit de Niveau/Filière (Un groupe d'élèves ne peut pas avoir deux cours en même temps)
        // Note: On utilise ici la logique de chevauchement aussi pour les élèves !
        const isNiveauOccupe = await coursService.checkCoursExistence(filiereId, niveauActif, targetDay, heure_debut, heure_fin, excludeId);
        if (isNiveauOccupe) {
          alert(`Conflit : Le niveau ${niveauActif} a déjà un cours programmé à ${heure_debut} le ${targetDay}.`);
          return { valid: false };
        }

        return { valid: true };
      } catch (err) {
        console.error("Erreur technique lors des vérifications:", err);
        return { valid: false };
      }
    };

    // 3. Exécution de la sauvegarde
    try {
      setIsSubmitting(true);
      const joursATraiter = sameMdayToFday
        ? jours.filter(j => !['samedi', 'dimanche'].includes(j))
        : [editingCours.jour];

      for (const jour of joursATraiter) {
        // On exclut l'ID uniquement si on modifie le cours original sur son jour original
        const isOriginalRecord = (editingCours.id && jour === editingCours.jour);
        const currentExcludeId = isOriginalRecord ? editingCours.id : null;

        const { valid } = await validateSchedule(editingCours, jour, currentExcludeId);
        if (!valid) continue; // On passe au jour suivant ou on stoppe si c'est le seul

        const payload = { ...editingCours, jour };

        let saved;
        if (isOriginalRecord) {
          saved = await coursService.update(editingCours.id, payload);
        } else {
          // Pour les copies "Lundi au Vendredi", on retire l'ID pour créer de nouveaux records
          const { id, ...newPayload } = payload;
          saved = await coursService.create(newPayload);
        }

        // Mise à jour de l'UI
        updateGlobalState(saved);
      }

      setIsEditMode(false);
      setEditingCours(null);
    } catch (error) {
      alert("Une erreur est survenue lors de l'enregistrement.");
    }finally {
      setIsSubmitting(false);
    }
  };

  // Fonction helper pour mettre à jour la liste sans tout recharger
  const updateGlobalState = (savedCours) => {
    const niveauObj = niveaux.find(n => n.id === savedCours.niveau_id);
    const formatted = { ...savedCours, niveau: niveauObj };

    setTousCours(prev => {
      const index = prev.findIndex(c => c.id === savedCours.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = formatted;
        return updated;
      }
      return [...prev, formatted];
    });
  };

  const handleDeleteCours = async (coursId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      try {
        await coursService.delete(coursId);
        setTousCours(prev => prev.filter(c => c.id !== coursId));
        //alert("Cours supprimé avec succès !");
      } catch (error) {
        console.error("Erreur de suppression:", error);
        alert("Erreur lors de la suppression du cours");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingCours(null);
  };

  const handleGeneratePDF = () => {
    // Navigation vers la page de génération PDF
    navigate(`/export/schedule/${filiereId}/${niveauActif}`);
  };

  const getCoursColor = (type) => {
    const colors = {
      "Cours": "bg-blue-50 border-blue-200 hover:bg-blue-100",
      "TD": "bg-green-50 border-green-200 hover:bg-green-100",
      "TP": "bg-purple-50 border-purple-200 hover:bg-purple-100",
      "Projet": "bg-orange-50 border-orange-200 hover:bg-orange-100",
      "Séminaire": "bg-pink-50 border-pink-200 hover:bg-pink-100",
      "Recherche": "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
      "Encadrement": "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      "Suivi": "bg-red-50 border-red-200 hover:bg-red-100"
    };
    return colors[type] || "bg-gray-50 border-gray-200 hover:bg-gray-100";
  };

  const getBadgeColor = (type) => {
    const colors = {
      "Cours": "bg-blue-600 text-white",
      "TD": "bg-green-600 text-white",
      "TP": "bg-purple-600 text-white",
      "Projet": "bg-orange-600 text-white",
      "Séminaire": "bg-pink-600 text-white",
      "Recherche": "bg-yellow-600 text-white",
      "Encadrement": "bg-indigo-600 text-white",
      "Suivi": "bg-red-600 text-white"
    };
    return colors[type] || "bg-gray-600 text-white";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'emploi du temps...</p>
        </div>
      </div>
    );
  }

  if (!filiere) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Filière introuvable</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 text-green-600 hover:text-green-700 font-semibold"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const cours = getCoursActuels();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au tableau de bord</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-xl text-white shadow-lg">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {filiere.name}
                </h1>
                <p className="text-gray-600 mt-1">Gestion de l'emploi du temps</p>
              </div>
            </div>

            {/* Bouton Générer PDF */}
            <button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              <FileDown className="w-5 h-5" />
              Générer PDF
            </button>
          </div>
        </div>

        {/* Sélecteur de niveau */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Niveau d'études</h3>
          <div className="flex flex-wrap gap-2">
            {niveaux.map((niveau) => (
              <button
                key={niveau.code}
                onClick={() => setNiveauActif(niveau.code)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${niveauActif === niveau.code
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {niveau.code}
              </button>
            ))}
          </div>
        </div>

        {/* Sélecteur de jour */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Jour de la semaine</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {jours.map((jour) => (
              <button
                key={jour}
                onClick={() => setJourActif(jour)}
                className={`px-4 py-2.5 rounded-lg font-semibold capitalize transition-all ${jourActif === jour
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {jour}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton Ajouter un cours */}
        {isAuthenticated && <div className="mb-6">
          <button
            onClick={handleAddCours}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Ajouter un cours
          </button>
        </div>}

        {/* Liste des cours */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {jourActif} - {niveauActif}
            </h2>
            <div className="text-sm text-gray-500">
              {cours.length} cours
            </div>
          </div>

          {cours.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Aucun cours pour ce jour</p>
              {isAuthenticated && <button
                onClick={handleAddCours}
                className="mt-4 text-green-600 hover:text-green-700 font-semibold"
              >
                Ajouter le premier cours
              </button>}
            </div>
          ) : (
            // Grid: 2 colonnes sur PC, 1 colonne sur mobile
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cours.map((coursItem) => {

                return (
                  <div
                    key={coursItem.id}
                    className={`border-2 rounded-xl p-5 transition-all ${getCoursColor(coursItem.type_cours)}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(coursItem.type_cours)}`}>
                            {coursItem.type_cours}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{coursItem.matiere}</h3>
                        <p className="text-sm text-gray-600">{coursItem.code_matiere}</p>
                      </div>

                      <div className="flex gap-2">
                        {isAuthenticated && <button
                          onClick={() => handleEditCours(coursItem)}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>}
                        {isAuthenticated && <button
                          onClick={() => handleDeleteCours(coursItem.id)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{coursItem.heure_debut.substring(0, 5)} - {coursItem.heure_fin.substring(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-green-600" />
                        <span>{coursItem.professeur || ""}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>Salle {coursItem.salle}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal d'édition */}
        {isEditMode && editingCours && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {editingCours.id ? "Modifier" : "Ajouter"} un cours
                  </h2>
                  <button onClick={handleCancelEdit} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Matière *
                    </label>
                    <input
                      type="text"
                      value={editingCours.matiere}
                      onChange={(e) => setEditingCours({ ...editingCours, matiere: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: Programmation Web"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Code *
                    </label>
                    <input
                      type="text"
                      value={editingCours.code_matiere}
                      onChange={(e) => setEditingCours({ ...editingCours, code_matiere: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ex: INF301"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={editingCours.heure_debut}
                      onChange={(e) => setEditingCours({ ...editingCours, heure_debut: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Heure de fin
                    </label>
                    <input
                      type="time"
                      value={editingCours.heure_fin}
                      onChange={(e) => setEditingCours({ ...editingCours, heure_fin: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Professeur
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Dr. Dupont, Mme. Martin, etc."
                      value={editingCours.professeur || ""}
                      onChange={(e) => setEditingCours({ ...editingCours, professeur: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salle
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Salle 14,15"
                      value={editingCours.salle || ""}
                      onChange={(e) => setEditingCours({ ...editingCours, salle: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />

                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type de cours
                    </label>
                    <select
                      value={editingCours.type_cours}
                      onChange={(e) => setEditingCours({ ...editingCours, type_cours: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {typesCours.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        name="monday_to_friday"
                        id="mtf"
                        className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all appearance-none checked:bg-blue-600 checked:border-transparent"
                        style={{
                          backgroundImage: sameMdayToFday ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` : 'none',
                          backgroundSize: '100% 100%',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                        checked={sameMdayToFday}
                        onChange={(e) => {
                          console.log({ MTF: e.target.checked });
                          setSameMdayToFday(e.target.checked);
                        }}
                      />
                    </div>
                    <label
                      htmlFor="mtf"
                      className="text-sm font-medium text-blue-900 cursor-pointer select-none"
                    >
                      Appliquer ce cours du <span className="font-bold underline">Lundi au Vendredi</span>
                    </label>
                  </div>
                </div>


                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      if (!IsSubmitting) {
                        handleSaveCours();
                      }
                    }}
                    disabled={IsSubmitting}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
                  >
                    {!IsSubmitting && <Save className="w-5 h-5" />}
                    {IsSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : null}
                    Enregistrer
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSchedule;
