import { createContext, useState,useContext, useEffect } from 'react';
import data from '../data/data.json';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {email:MAIL,password:PSWD} = data.admin_credentials;

  // Vérifier si déjà connecté au chargement
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email, password) => {
    if (email === MAIL && password === PSWD) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// example utilisation dans app.jsx
// import { useAuth } from './contexts/AuthContext.js'  
// const { isAuthenticated, login, logout } = useAuth();
// if (isAuthenticated) { ... }
// login(email, password);  
// logout();
