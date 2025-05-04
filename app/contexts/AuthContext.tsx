import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Constants } from 'expo-constants';

// Import the mock service by default
import MockAuthService from '../services/AuthService';

// Define interface for our auth services
interface AuthService {
  GoogleAuth: {
    signIn: () => Promise<{ success: boolean; user?: UserData; error?: string }>;
    signOut: () => Promise<{ success: boolean; error?: string }>;
  };
}

// Start with the mock service
let authService: AuthService = MockAuthService;

// Set up a way to get the auth services
const getAuthServices = async (): Promise<AuthService> => {
  try {
    // Try to import the prod service
    const ProdAuthService = await import('../services/AuthService.prod');
    return ProdAuthService.default;
  } catch (error) {
    console.log('Using mock auth service because production auth service failed to load:', error);
    return MockAuthService;
  }
};

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
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: UserData | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => ({ success: false }),
  setIsAuthenticated: () => {},
  setUser: () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [authServicesReady, setAuthServicesReady] = useState(false);

  // Initialize auth services
  useEffect(() => {
    const setupAuthServices = async () => {
      try {
        authService = await getAuthServices();
      } catch (error) {
        console.error('Failed to load auth services:', error);
      } finally {
        setAuthServicesReady(true);
      }
    };

    setupAuthServices();
  }, []);

  // Check auth state after auth services are ready
  useEffect(() => {
    if (authServicesReady) {
      checkAuthState();
    }
  }, [authServicesReady]);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (token && userDataString) {
        const userData = JSON.parse(userDataString) as UserData;
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clear any stale data
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Clear any potentially corrupted data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Simple validation
      if (!email || !email.includes('@') || !password || password.length < 6) {
        throw new Error('Invalid email or password. Password must be at least 6 characters.');
      }
      
      // In a real app, this would be an API call to your backend
      // For now, we'll just simulate a successful login with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create userData dynamically based on email
      const namePart = email.split('@')[0];
      const userName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      
      const userData: UserData = {
        name: userName,
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
      await AsyncStorage.setItem('userToken', 'email-' + Date.now().toString());
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Try to sign out from Google if the user signed in with Google
      try {
        await authService.GoogleAuth.signOut();
      } catch (e) {
        console.log('Not signed in with Google or error signing out from Google');
      }
      
      // Clear all user data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await authService.GoogleAuth.signIn();
      
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

  // If auth services aren't ready yet, show nothing
  if (!authServicesReady) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user,
      signIn, 
      signOut,
      signInWithGoogle,
      setIsAuthenticated,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider; 