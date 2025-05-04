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

// Additional interface to handle the Google Sign-In response
interface CustomGoogleSignInResponse {
  user?: {
    id: string;
    name: string;
    email: string;
    photo: string;
  };
  idToken?: string;
  serverAuthCode?: string;
  scopes?: string[];
}

// Initialize Google Sign-In with simpler configuration to avoid DEVELOPER_ERROR
GoogleSignin.configure({
  webClientId: '335867544363-6emdh857su1okmbp8gjfecso3vit2urb.apps.googleusercontent.com',
  offlineAccess: false,
  forceCodeForRefreshToken: true,
  scopes: ['profile', 'email']
});

export const GoogleAuth = {
  // Sign in with Google
  signIn: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
    try {
      console.log("GoogleAuth.signIn: Starting Google Sign-In process");
      
      // Check if Play Services are available 
      const hasPlayServices = await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      if (!hasPlayServices) {
        throw new Error('Play Services not available');
      }
      console.log("GoogleAuth.signIn: Play Services check passed");
      
      // Get Google user info
      console.log("GoogleAuth.signIn: Requesting sign in");
      const response = await GoogleSignin.signIn() as unknown as CustomGoogleSignInResponse;
      
      if (!response?.user) {
        throw new Error('No user data received from Google');
      }
      
      console.log("Google Sign-In successful:", JSON.stringify(response, null, 2));
      
      // Extract user data using our custom interface
      const userName = response.user.name || 'Google User';
      const userEmail = response.user.email || '';
      const userId = response.user.id || Date.now().toString();
      
      // Create user data to save
      const userData: UserData = {
        name: userName,
        email: userEmail,
        avatar: response.user.photo || 'avatar1.png',
        status: 'Music lover and radio enthusiast 🎧',
        country: {
          name: "United States",
          code: "US",
          flag: "🇺🇸"
        }
      };
      
      // Save user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userToken', `google-${userId}`);
      
      return {
        success: true,
        user: userData
      };
    } catch (error: any) {
      console.error("Google Sign-In error full:", error);
      let errorMessage = 'Failed to sign in with Google';
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in cancelled';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in already in progress';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Play services not available or outdated';
      } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        errorMessage = 'Sign in required';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error("Google Sign-In error:", errorMessage);
      
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
    } catch (error: any) {
      console.error('Google sign out error:', error);
      return {
        success: false,
        error: 'Error signing out'
      };
    }
  },
  
  // Check if user is signed in
  isSignedIn: async (): Promise<boolean> => {
    try {
      // Just check if we have a token in AsyncStorage for simplicity
      const token = await AsyncStorage.getItem('userToken');
      return !!token && token.startsWith('google-');
    } catch (error: any) {
      console.error('Error checking Google sign in status:', error);
      return false;
    }
  },
  
  // Get current user info
  getCurrentUser: async (): Promise<{ success: boolean; user?: UserData; error?: string }> => {
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

const AuthServices = {
  GoogleAuth
};

export default AuthServices; 