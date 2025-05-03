import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuth, FacebookAuth } from '../services/AuthService';

interface UserData {
  name: string;
  email?: string;
  avatar: string;
  status?: string;
  country?: {
    name: string;
    code: string;
    flag: string;
  };
}

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => ({ success: false }),
  signInWithFacebook: async () => ({ success: false }),
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (token && userDataString) {
        const userData = JSON.parse(userDataString) as UserData;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Here you would typically make an API call to your backend
      // For now, we'll just simulate a successful login
      const userData: UserData = {
        name: 'Test User',
        email: email,
        avatar: 'avatar1.png',
        status: 'Music lover and radio enthusiast 🎧',
        country: {
          name: 'United States',
          code: 'US',
          flag: '🇺🇸'
        }
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', 'dummy-token');
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error signing in:', error);
      throw new Error('Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      // Try to sign out from Google if the user signed in with Google
      try {
        await GoogleAuth.signOut();
      } catch (e) {
        console.log('Not signed in with Google or error signing out from Google');
      }
      
      // Clear all user data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await GoogleAuth.signIn();
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: result.error || 'Google sign in failed'
      };
    } catch (error: any) {
      console.error('Error with Google sign in:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred with Google sign in'
      };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await FacebookAuth.signIn();
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: result.error || 'Facebook sign in failed'
      };
    } catch (error: any) {
      console.error('Error with Facebook sign in:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred with Facebook sign in'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user,
      signIn, 
      signOut,
      signInWithGoogle,
      signInWithFacebook
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider; 