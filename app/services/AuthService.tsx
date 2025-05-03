import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: '335867544363-3pdr103robphkmcnh0ri5qi8ncknn0d6.apps.googleusercontent.com', // from google-services.json
  offlineAccess: true,
});

export const GoogleAuth = {
  // Sign in with Google
  signIn: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      await GoogleSignin.hasPlayServices();
      
      // Get Google user info - use any to avoid type issues
      const googleUser: any = await GoogleSignin.signIn();
      
      // Create user data to save
      const userData: UserData = {
        name: googleUser?.user?.name || 'Google User',
        email: googleUser?.user?.email || '',
        avatar: 'avatar1.png', // default avatar
        status: 'Music lover and radio enthusiast 🎧',
        country: {
          name: 'United States',
          code: 'US',
          flag: '🇺🇸'
        }
      };
      
      // Save user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', `google-${googleUser?.user?.id || Date.now()}`);
      
      return {
        success: true,
        user: userData
      };
    } catch (error: any) {
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Play services not available or outdated';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // Sign out from Google
  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await GoogleSignin.signOut();
      await AsyncStorage.removeItem('userToken');
      return { success: true };
    } catch (error) {
      console.error('Google sign out error:', error);
      return {
        success: false,
        error: 'Error signing out'
      };
    }
  },
  
  // Get current user info if already signed in
  getCurrentUserInfo: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        const userData: UserData = {
          name: currentUser.user.name || 'Google User',
          email: currentUser.user.email,
          avatar: 'avatar1.png',
          status: 'Music lover and radio enthusiast 🎧',
          country: {
            name: 'United States',
            code: 'US',
            flag: '🇺🇸'
          }
        };
        
        return {
          success: true,
          user: userData
        };
      }
      
      return {
        success: false,
        error: 'No current user'
      };
    } catch (error) {
      console.error('Error getting current Google user:', error);
      return {
        success: false,
        error: 'Error getting current user'
      };
    }
  }
};

export const FacebookAuth = {
  // Facebook authentication will be implemented later
  signIn: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    return {
      success: false,
      error: 'Facebook authentication not yet implemented'
    };
  },
  
  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    return {
      success: false,
      error: 'Facebook authentication not yet implemented'
    };
  }
};

export default {
  GoogleAuth,
  FacebookAuth
}; 