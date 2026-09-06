import { Link } from 'react-router-dom';
import HECM_LOGO from '../../public/logo.png';

const Footer = () => {

  return (
    <footer className="bg-red-600 text-white py-8 md:py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Logo section */}
          <div className="flex flex-col items-start">
            <img src={HECM_LOGO} alt="HECM Logo" className="h-16 w-auto mb-4" />
            <p className="text-sm text-red-50 leading-relaxed">
              Haute École de Commerce et de Management - Leader dans la formation en commerce, management et gestion en Afrique.
            </p>
          </div>

          {/* Navigation section */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/formations" className="hover:text-red-200 transition-colors inline-block">
                  Formations
                </Link>
              </li>
              <li>
                <Link to="/admissions" className="hover:text-red-200 transition-colors inline-block">
                  Admissions
                </Link>
              </li>
              <li>
                <Link to="/actualites" className="hover:text-red-200 transition-colors inline-block">
                  Actualités
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources section */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-4">Ressources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-red-200 transition-colors inline-block">
                  Webmail
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors inline-block">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-red-200 transition-colors inline-block">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-red-500 mt-8 md:mt-12 pt-6">
          <p className="text-center text-xs sm:text-sm">
            © 1999–2026 HECM - École Leader — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;