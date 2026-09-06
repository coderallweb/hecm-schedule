import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Phone, Mail, Menu, X } from 'lucide-react';
import HECM_LOGO from '../../public/logo.png';
import { useState } from 'react';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top bar with contact info */}
      <div className="bg-green-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0 text-xs md:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <a href="tel:+22901213248889" className="flex items-center hover:text-green-100 transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">+229 01 21 32 48 89 / +229 01 95 42 41 71</span>
              </a>
              <a href="mailto:contact@hecm-afrique.net" className="flex items-center hover:text-green-100 transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                <span>contact@hecm-afrique.net</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white font-medium transition-colors text-xs"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo  image*/}
          <Link to="/" className="flex items-center group">
            <img src={HECM_LOGO} alt="HECM Logo" className="h-20 w-auto" />
          </Link>

          {/* Desktop Navigation menu */}

          <>
            <nav className="hidden lg:flex items-center font-bold text-4xl space-x-6 xl:space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-green-900 font-medium text-sm xl:text-base uppercase transition-colors"
              >
                Accueil
              </Link>
              <Link
                to="https://www.hecm-afrique.net/formations.php"
                target='_blank'
                className="text-gray-700 hover:text-green-700 font-medium text-sm xl:text-base uppercase transition-colors"
              >
                Nos Formations
              </Link>
              <Link
                to="/dashboard#filiere-grid"
                className="text-gray-700 hover:text-green-700 font-medium text-sm xl:text-base uppercase transition-colors"
              >
                Nos Filieres (Planning)
              </Link>
              <Link
                to="https://www.hecm-afrique.net/contact.php"
                className="text-gray-700 hover:text-green-700 font-medium text-sm xl:text-base uppercase transition-colors"
              >
                Contact
              </Link>
              
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-green-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </>

        </div>

        {/* Mobile Navigation menu */}
        { mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              <Link
                to="/dashboard"
                className="text-green-700 hover:text-green-900 font-medium text-sm uppercase transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="https://www.hecm-afrique.net/formations.php"
                target='_blank'
                className="text-gray-700 hover:text-green-700 font-medium text-sm uppercase transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nos Formations
              </Link>
              <Link
                to="/dashboard#filiere-grid"
                className="text-gray-700 hover:text-green-700 font-medium text-sm uppercase transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nos Filieres (Planning)
              </Link>
              <Link
                to="https://www.hecm-afrique.net/contact.php"
                className="text-gray-700 hover:text-green-700 font-medium text-sm uppercase transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;