import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoggingOut) {
      loadUser();
    }
  }, [isLoggingOut]);

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoggingOut(false); // Réactiver le chargement automatique
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const { token: newToken, ...userData } = response.data;
        
        await AsyncStorage.setItem('userToken', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion',
      };
    }
  };

  const register = async (userData) => {
    try {
      setIsLoggingOut(false); // Réactiver le chargement automatique
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { token: newToken, ...userInfo } = response.data;
        
        await AsyncStorage.setItem('userToken', newToken);
        await AsyncStorage.setItem('user', JSON.stringify(userInfo));
        
        setToken(newToken);
        setUser(userInfo);
        
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur d'inscription",
      };
    }
  };

  const logout = async () => {
    console.log('🚪 Début du logout...');
    
    // Marquer qu'on est en train de se déconnecter
    setIsLoggingOut(true);
    
    // Sauvegarder le token avant de le supprimer
    const currentToken = token;
    
    // Réinitialiser l'état immédiatement pour une UX rapide
    setToken(null);
    setUser(null);
    setLoading(false);
    
    try {
      // Faire la requête de logout au serveur d'abord (avec le token sauvegardé)
      if (currentToken) {
        authAPI.logout().catch((error) => {
          console.log('⚠️ Erreur logout serveur (ignorée):', error.message);
        });
      }
      
      // Nettoyer le stockage local
      await AsyncStorage.multiRemove(['userToken', 'user']);
      console.log('✅ Storage nettoyé');
    } catch (error) {
      console.error('❌ Erreur lors du logout:', error);
      // Même en cas d'erreur, l'état est déjà réinitialisé
    }
    
    console.log('✅ Logout terminé');
  };

  const updateUser = async (newUserData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
    }
  };

  // Calculer isAuthenticated directement (pas de useMemo)
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};