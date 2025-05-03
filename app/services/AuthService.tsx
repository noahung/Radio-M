import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Define our user data interface
interface UserData {
  name: string;
  email?: string;
  avatar: string;
  status: string;
  country: {
    name: string;
    code: string;
    flag: string;
  };
}

// Simple mock for Google Sign-In during development in Expo Go
// In a production build, you would use the actual @react-native-google-signin/google-signin
export const GoogleAuth = {
  // Sign in with Google
  signIn: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      // Mock Google Sign-In (for development in Expo Go)
      console.log('Mock Google Sign-In for development');
      
      // Create fake user data for development
      const userData: UserData = {
        name: "Google User",
        email: "google@example.com",
        avatar: "avatar1.png", // default avatar
        status: "Music lover and radio enthusiast 🎧",
        country: {
          name: "United States",
          code: "US",
          flag: "🇺🇸"
        }
      };
      
      // Save user data to AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', `google-${Date.now()}`);
      
      return {
        success: true,
        user: userData
      };
    } catch (error: any) {
      console.error('Mock Google sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with Google'
      };
    }
  },
  
  // Sign out from Google
  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Just remove the token
      await AsyncStorage.removeItem('userToken');
      return { success: true };
    } catch (error: any) {
      console.error('Google sign out error:', error);
      return {
        success: false,
        error: 'Error signing out'
      };
    }
  },
  
  // Get current user info
  getCurrentUserInfo: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString) as UserData;
        return {
          success: true,
          user: userData
        };
      }
      
      return {
        success: false,
        error: 'No current user'
      };
    } catch (error: any) {
      console.error('Error getting current Google user:', error);
      return {
        success: false,
        error: 'Error getting current user'
      };
    }
  }
};

export const FacebookAuth = {
  // Mock Facebook authentication for development
  signIn: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      console.log('Mock Facebook Sign-In for development');
      
      // Create fake Facebook user data
      const userData: UserData = {
        name: "Facebook User",
        email: "facebook@example.com",
        avatar: "avatar2.png",
        status: "Music lover and radio enthusiast 🎧",
        country: {
          name: "United States",
          code: "US",
          flag: "🇺🇸"
        }
      };
      
      // Save user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', `facebook-${Date.now()}`);
      
      return {
        success: true,
        user: userData
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Facebook authentication error'
      };
    }
  },
  
  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await AsyncStorage.removeItem('userToken');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error signing out of Facebook'
      };
    }
  }
};

export default {
  GoogleAuth,
  FacebookAuth
}; 