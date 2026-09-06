import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Lock, User, Eye, EyeOff, LogIn } from "lucide-react";
import HECM_LOGO from "../../public/logo.png";
// eslint-disable-next-line no-unused-vars
import supabaseService from "../services/supabaseService";


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const FILIERES_DATA = [
    {
      code: "mcc",
      nom: "Marketing Communication et Commerce",
      description: "Formation axée sur les stratégies de vente, la promotion de marque et la gestion de la relation client."
    },
    {
      code: "fca",
      nom: "Finance Comptabilité et Audit",
      description: "Expertise en gestion financière, tenue des comptes et vérification de la conformité comptable des entreprises."
    },
    {
      code: "bfa",
      nom: "Banque Finance et Assurances",
      description: "Spécialisation dans les produits financiers, la gestion des risques bancaires et le secteur des assurances."
    },
    {
      code: "grh",
      nom: "Gestion des Ressources Humaines",
      description: "Développement des compétences en recrutement, gestion des carrières et administration du personnel."
    },
    {
      code: "tl",
      nom: "Transport Logistique",
      description: "Gestion de la chaîne logistique, optimisation des flux de marchandises et organisation des transports."
    },
    {
      code: "egp",
      nom: "Entreprenariat et Gestion de Projets",
      description: "Apprentissage de la création d'entreprise et pilotage de projets de bout en bout."
    },
    {
      code: "ad",
      nom: "Assistant de Direction",
      description: "Support stratégique aux dirigeants : organisation, communication et gestion administrative avancée."
    },
    {
      code: "iim",
      nom: "Informatique Industrielle et Maintenance",
      description: "Maintenance du matériel informatique et automatisation des processus de production industrielle."
    },
    {
      code: "rit",
      nom: "Reseau Informatique et Télécommunication",
      description: "Conception et administration des infrastructures réseaux et des systèmes de télécommunication."
    },
    {
      code: "sil",
      nom: "Systemes Informatiques et Logiciels",
      description: "Développement d'applications, programmation et architecture des systèmes logiciels."
    },
    {
      code: "th",
      nom: "Tourisme et Hotellerie",
      description: "Gestion des services touristiques, promotion du patrimoine et accueil en milieu hôtelier."
    },
    {
      code: "j",
      nom: "Journalisme",
      description: "Collecte, traitement et diffusion de l'information via les différents supports médias."
    },
    {
      code: "cqga",
      nom: "Contrôle Qualité Génie Agroalimentaire",
      description: "Sécurité alimentaire et contrôle des processus de transformation des produits agricoles."
    },
    {
      code: "gi",
      nom: "Génie Informatique",
      description: "Formation polyvalente couvrant le hardware, le software et l'intégration de systèmes."
    },
    {
      code: "abm",
      nom: "Analyse Biomédical",
      description: "Techniques de laboratoire pour le diagnostic médical et l'analyse biologique."
    },
    {
      code: "sjp",
      nom: "Science Juridiques et Politiques",
      description: "Étude des institutions publiques, du droit constitutionnel et des relations de pouvoir."
    },
    {
      code: "se",
      nom: "Sciences Economiques",
      description: "Analyse des mécanismes de marché, de la microéconomie et de la politique économique."
    },
    {
      code: "gcl",
      nom: "Gestion des Collectivités Locales",
      description: "Administration du territoire et gestion des services publics à l'échelle locale."
    },
    {
      code: "gpm",
      nom: "Gestion et Passation des Marchés",
      description: "Spécialisation dans les procédures d'appels d'offres et la réglementation des marchés publics."
    },
    {
      code: "gc",
      nom: "Génie Civil",
      description: "Conception, construction et réhabilitation des infrastructures et bâtiments."
    },
    {
      code: "ssi",
      nom: "Sécurité des Systèmes Informatique",
      description: "Protection des données, cybersécurité et défense des réseaux contre les intrusions."
    },
    {
      code: "ri",
      nom: "Relations Internationales",
      description: "Analyse de la diplomatie, des conflits mondiaux et de la coopération entre États."
    },
    {
      code: "da",
      nom: "Droit des Affaires",
      description: "Réglementation juridique des activités commerciales et gestion des contentieux en entreprise."
    },
    {
      code: "ea",
      nom: "Eau et Assainissement",
      description: "Gestion des ressources hydriques, traitement des eaux et réseaux d'assainissement."
    },
    {
      code: "gt",
      nom: "Géomètre Topographe",
      description: "Mesures de terrain, levés topographiques et établissement de plans cartographiques."
    },
    {
      code: "geer",
      nom: "Génie Electrique, Energie Renouvelable",
      description: "Installation électrique industrielle et intégration des solutions d'énergie solaire et éolienne."
    },
    {
      code: "fc",
      nom: "Froid et Climatisation",
      description: "Maintenance et installation des systèmes thermiques et frigorifiques."
    },
    {
      code: "hr",
      nom: "Hotellerie Restauration",
      description: "Management opérationnel des restaurants et techniques culinaires professionnelles."
    }
  ];

  const handleCreateFiliere = async () => {
    try {
      FILIERES_DATA.forEach(async (filiere) => {
        const newFiliere = {
          code: filiere.code,
          name: filiere.nom,
          description: filiere.description
        };
        await supabaseService.filieres.create(newFiliere);
        console.log(`Filière ${filiere.code} créée`);
      });

    } catch (error) {
      console.error("Erreur lors de la création de la filière :", error.message);
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setError('');
    //await handleCreateFiliere(); // Appel de la fonction pour créer les filières dans la base de données

    if (email === '' || password === '') {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);

    // Simuler un délai de chargement
    setTimeout(() => {
      if (login(email, password)) {
        navigate('/dashboard');
      } else {
        setError('Email ou mot de passe incorrect.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header avec le logo */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-5 text-center">
            <img src={HECM_LOGO} alt="Logo HECM" className="mx-auto h-16 w-16 object-contain" />
            <h2 className="text-2xl font-bold text-white mb-2">Espace Administrateur</h2>
            <p className="text-green-100 text-sm">Connectez-vous pour gérer les programmes</p>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="admin@hecm-afrique.net"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Accès réservé aux administrateurs HECM
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Besoin d'aide ? Contactez{' '}
            <a href="mailto:contact@hecm-afrique.net" className="text-green-600 hover:text-green-700 font-semibold">
              contact@hecm-afrique.net
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;