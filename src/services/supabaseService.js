import { supabase } from "../lib/supabase";

// ============================================
// SERVICES FILIÈRES
// ============================================

export const filiereService = {
  // Récupérer toutes les filières
  async getAll() {
    const { data, error } = await supabase
      .from("filieres")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  // Récupérer une filière par ID
  async getById(id) {
    const { data, error } = await supabase
      .from("filieres")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une filière
  async create(filiere) {
    const { data, error } = await supabase
      .from("filieres")
      .insert(filiere)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une filière
  async update(id, filiere) {
    const { data, error } = await supabase
      .from("filieres")
      .update(filiere)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une filière
  async delete(id) {
    const { error } = await supabase
      .from("filieres")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};

// ============================================
// SERVICES NIVEAUX
// ============================================

export const niveauService = {
  // Récupérer tous les niveaux
  async getAll() {
    const { data, error } = await supabase
      .from("niveaux")
      .select("*")
      .order("ordre");

    if (error) throw error;
    return data;
  },

  // Récupérer un niveau par code (L1, L2, etc.)
  async getByCode(code) {
    const { data, error } = await supabase
      .from("niveaux")
      .select("*")
      .eq("code", code)
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// SERVICES PROFESSEURS
// ============================================

export const professeurService = {
  // Récupérer tous les professeurs
  async getAll() {
    const { data, error } = await supabase
      .from("professeurs")
      .select("*")
      .order("nom");

    if (error) throw error;
    return data;
  },

  // Récupérer un professeur par ID
  async getById(id) {
    const { data, error } = await supabase
      .from("professeurs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un professeur
  async create(professeur) {
    const { data, error } = await supabase
      .from("professeurs")
      .insert(professeur)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un professeur
  async update(id, professeur) {
    const { data, error } = await supabase
      .from("professeurs")
      .update(professeur)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un professeur
  async delete(id) {
    const { error } = await supabase
      .from("professeurs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};

// ============================================
// SERVICES SALLES
// ============================================

export const salleService = {
  // Récupérer toutes les salles
  async getAll() {
    const { data, error } = await supabase
      .from("salles")
      .select("*")
      .order("numero");

    if (error) throw error;
    return data;
  },

  // Récupérer une salle par ID
  async getById(id) {
    const { data, error } = await supabase
      .from("salles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une salle
  async create(salle) {
    const { data, error } = await supabase
      .from("salles")
      .insert(salle)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une salle
  async update(id, salle) {
    const { data, error } = await supabase
      .from("salles")
      .update(salle)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer une salle
  async delete(id) {
    const { error } = await supabase
      .from("salles")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};

// ============================================
// SERVICES COURS (EMPLOI DU TEMPS)
// ============================================

export const coursService = {
  // Récupérer tous les cours d'une filière et d'un niveau
  async getByFiliereAndNiveau(filiereId, niveauCode) {
    // D'abord récupérer l'ID du niveau
    const niveau = await niveauService.getByCode(niveauCode);

    const { data, error } = await supabase
      .from("cours_schedule")
      .select(`
        *
      `)
      .eq("filiere_id", filiereId)
      .eq("niveau_id", niveau.id)
      .order("jour")
      .order("heure_debut");

    if (error) throw error;
    return data;
  },

  // Récupérer tous les cours d'une filière (tous niveaux)
  async getByFiliere(filiereId) {
    const { data, error } = await supabase
      .from("cours_schedule")
      .select(`
        *,
        niveau:niveaux(code, name)
      `)
      .eq("filiere_id", filiereId)
      .order("jour")
      .order("heure_debut");

    if (error) throw error;
    return data;
  },

  // Récupérer les cours d'une filière, niveau et jour spécifiques
  async getByFiliereNiveauJour(filiereId, niveauCode, jour) {
    const niveau = await niveauService.getByCode(niveauCode);

    const { data, error } = await supabase
      .from("cours")
      .select(`
        *,
        professeur:professeurs(id, nom, prenom, specialite),
        salle:salles(id, numero, type, capacite)
      `)
      .eq("filiere_id", filiereId)
      .eq("niveau_id", niveau.id)
      .eq("jour", jour)
      .order("heure_debut");

    if (error) throw error;
    return data;
  },

  // Créer un cours
  async create(cours) {
    // Si on reçoit un code de niveau, le convertir en ID
    if (cours.niveau_code && !cours.niveau_id) {
      const niveau = await niveauService.getByCode(cours.niveau_code);
      cours.niveau_id = niveau.id;
      delete cours.niveau_code;
    }

    console.log("Création du cours:", cours);
    const { data, error } = await supabase
      .from("cours_schedule")
      .insert(cours)
      .select(`*`)
      .single();

    if (error) {
      console.log(error);
    } //throw error;
    return data;
  },

  // Mettre à jour un cours
  async update(id, cours) {
    // Debug : afficher le contenu de "cours"
    console.log("Mise à jour du cours avec ID:", id);
    console.log("Données du cours:", cours);
    // Si on reçoit un code de niveau, le convertir en ID
    /*
    if (cours.niveau_code && !cours.niveau_id) {
      const niveau = await niveauService.getByCode(cours.niveau_code);
      cours.niveau_id = niveau.id;
      delete cours.niveau_code;
    }*/
    delete cours.niveau;
    const { data, error } = await supabase
      .from("cours_schedule")
      .update(cours)
      .eq("id", id)
      .select(`*`)
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un cours
  async delete(id) {
    const { error } = await supabase
      .from("cours_schedule")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Vérifier les conflits de salle (même salle, même jour, mêmes horaires)
  async checkSalleConflict(salle, jour, heureDebut, heureFin, excludeCoursId = null) {
    let query = supabase
      .from("cours_schedule")
      .select("*")
      .eq("salle", salle)
      .eq("jour", jour)
      .or(`and(heure_debut.lt.${heureFin},heure_fin.gt.${heureDebut})`);

    if (excludeCoursId) {
      query = query.neq("id", excludeCoursId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0; // true si conflit
  },

  // Vérifier si les étudiants (Filière + Niveau) ont déjà un cours sur ce créneau
  async checkCoursExistence(filiereId, niveauCode, jour, heureDebut, heureFin, excludeCoursId = null) {
    // 1. Récupérer l'ID du niveau à partir du code (L3, M1, etc.)
    const niveau = await niveauService.getByCode(niveauCode);
    if (!niveau) throw new Error("Niveau introuvable");

    // 2. Requête avec logique de chevauchement (Overlap)
    let query = supabase
      .from("cours_schedule")
      .select("*")
      .eq("filiere_id", filiereId)
      .eq("niveau_id", niveau.id)
      .eq("jour", jour)
      // Logique : (DebutExistant < FinNouveau) ET (FinExistant > DebutNouveau)
      .or(`and(heure_debut.lt.${heureFin},heure_fin.gt.${heureDebut})`);

    if (excludeCoursId) {
      query = query.neq("id", excludeCoursId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0; // Retourne true s'il y a un conflit
  },
  
  // Vérifier les conflits de professeur
  async checkProfesseurConflict(professeur, jour, heureDebut, heureFin, excludeCoursId = null) {
    let query = supabase
      .from("cours_schedule")
      .select("*")
      .eq("professeur", professeur)
      .eq("jour", jour)
      .or(`and(heure_debut.lt.${heureFin},heure_fin.gt.${heureDebut})`);

    if (excludeCoursId) {
      query = query.neq("id", excludeCoursId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0; // true si conflit
  },

  // Récupérer l'emploi du temps complet via la vue
  async getEmploiTempsComplet(filiereId = null, niveauCode = null) {
    let query = supabase
      .from("v_emploi_temps_complet")
      .select("*");

    if (filiereId) {
      query = query.eq("filiere_id", filiereId);
    }

    if (niveauCode) {
      query = query.eq("niveau_code", niveauCode);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }
};

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default {
  filieres: filiereService,
  niveaux: niveauService,
  professeurs: professeurService,
  salles: salleService,
  cours: coursService
};