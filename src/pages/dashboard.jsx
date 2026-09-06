import { useEffect, useState, memo,useMemo } from "react";
import { Link } from 'react-router-dom';
import { GraduationCap, Calendar, Users, Clock, ArrowRight, BookOpen, AlertCircle,Search,X } from "lucide-react";
import { filiereService } from "../services/supabaseService";
import { useAuth } from "../contexts/AuthContext";

// Composant Stat réutilisable
// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
  </div>
);

// Composant Skeleton pour le chargement
const CardSkeleton = () => (
  <div className="bg-gray-200 animate-pulse rounded-2xl h-64 w-full"></div>
);


// ... (Composants StatCard et CardSkeleton restent identiques)

const CardFiliere = memo(({ filiere, isAuthenticated }) => {
  return (
    <Link to={`/schedule/${filiere.id}`} className="group block">
      <div className="h-full bg-white border border-gray-200 rounded-2xl shadow-sm group-hover:shadow-xl group-hover:border-green-200 transition-all duration-300 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="bg-white/10 w-fit p-2.5 rounded-xl backdrop-blur-md">
                <GraduationCap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold leading-tight uppercase tracking-tight">{filiere.name}</h3>
            </div>
            <div className="bg-green-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 flex-grow">
          <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
            {filiere.description || "Aucune description disponible pour cette filière."}
          </p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
              <Calendar className="w-4 h-4 text-green-500" />
              <span>Planning</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
              <Clock className="w-4 h-4 text-green-500" />
              <span>Full-time</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="w-full py-3 bg-gray-50 group-hover:bg-green-600 rounded-xl border border-gray-100 group-hover:border-green-500 text-center transition-colors">
            <span className="text-xs font-bold text-gray-600 group-hover:text-white uppercase tracking-widest">
              {isAuthenticated ? "Gérer le planning" : "Voir le planning"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

const Dashboard = () => {
  const [filieres, setFilieres] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État pour la recherche
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const getFilieres = async () => {
      try {
        const data = await filiereService.getAll();
        setFilieres(data || []);
      } catch (err) {
        setError("Impossible de récupérer les filières.");
      } finally {
        setIsLoading(false);
      }
    };
    getFilieres();
  }, []);

  // Filtrage intelligent des filières
  const filteredFilieres = useMemo(() => {
    return filieres.filter((f) => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (f.code && f.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [filieres, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-900 -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-green-500 p-4 rounded-2xl shadow-lg shadow-green-500/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                {isAuthenticated ? "Tableau de Bord" : "HECM Afrique"}
              </h1>
              <p className="text-slate-400 font-medium">Portail des emplois du temps</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatCard title="Filières" value={filieres.length} icon={GraduationCap} colorClass="bg-green-50 text-green-600" />
          <StatCard title="Résultats" value={filteredFilieres.length} icon={Search} colorClass="bg-orange-50 text-orange-600" />
          <StatCard title="Étudiants" value="+1.2k" icon={Users} colorClass="bg-blue-50 text-blue-600" />
        </div>

        {/* Barre de Recherche et Titre */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Filières Académiques</h2>
              <p className="text-gray-500 text-sm">Sélectionnez votre spécialité pour voir les cours</p>
            </div>
            
            {/* Input de recherche stylisé */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une filière (ex: SIL, Marketing...)"
                className="block w-full pl-11 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center gap-4 text-red-700 mb-8">
              <AlertCircle className="w-6 h-6" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Grille de Résultats */}
          <div id="filiere-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
            ) : filteredFilieres.length > 0 ? (
              filteredFilieres.map((filiere) => (
                <CardFiliere isAuthenticated={isAuthenticated} key={filiere.id} filiere={filiere} />
              ))
            ) : null}
          </div>

          {/* État Vide (Pas de résultat de recherche) */}
          {!isLoading && filteredFilieres.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl py-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Aucun résultat pour "{searchTerm}"</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Vérifiez l'orthographe ou essayez un autre mot-clé.</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="mt-6 text-green-600 font-bold hover:underline"
              >
                Effacer la recherche
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;