import React, { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Image, Animated, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
// import mobileAds from 'react-native-google-mobile-ads';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Keep splash screen visible until we're ready to hide it
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore errors */
});

// Preload splash GIF
const splashGif = require('../assets/images/splash.gif');

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="player/[id]" 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="playlist/[id]" 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="category/[id]" 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('playback-controls', {
      name: 'Playback Controls',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 0, 0, 0],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: null,
      enableLights: false,
      enableVibrate: false,
      showBadge: false,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export default function RootLayout() {
  const [isSplashReady, setSplashReady] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSplashLoaded, setSplashLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Initialize mobile ads SDK
  useEffect(() => {
    const initializeAds = async () => {
      try {
        // Mobile ads initialization skipped
        console.log('Mobile ads SDK initialization skipped');
      } catch (error) {
        console.error('Error initializing mobile ads:', error);
      }
    };
    initializeAds();
  }, []);

  // Request notification permissions on app start
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Preload splash image
  useEffect(() => {
    async function loadSplashGif() {
      try {
        await Asset.loadAsync([splashGif]);
        console.log("Splash GIF loaded successfully");
        setSplashLoaded(true);
      } catch (e) {
        console.error('Failed to load splash GIF:', e);
        setSplashLoaded(true); // Continue anyway
      }
    }
    
    loadSplashGif();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    try {
      if (fontsLoaded || fontError) {
        setIsReady(true);
      }
    } catch (e) {
      console.error('Error in onLayoutRootView:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await onLayoutRootView();
      } catch (e) {
        if (mounted) {
          console.error('Initialization error:', e);
          setError(e instanceof Error ? e.message : 'An error occurred');
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [onLayoutRootView]);

  useEffect(() => {
    if (!isSplashLoaded) return;
    
    console.log("Starting splash screen timer");
    
    const timer = setTimeout(() => {
      console.log("Splash timer complete, starting fade out");
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(async () => {
        setSplashReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error('Error hiding splash screen:', e);
        }
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [isSplashLoaded, fadeAnim]);

  if (!isReady || !isSplashReady) {
    return (
      <Animated.View 
        style={{
          flex: 1,
          opacity: fadeAnim,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image 
          source={splashGif}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
        />
      </Animated.View>
    );
  }

  return (
    <SettingsProvider>
      <AudioProvider>
        <RootLayoutNav />
      </AudioProvider>
    </SettingsProvider>
  );
}