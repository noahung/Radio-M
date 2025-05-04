import React, { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, Image, Animated, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isRootRoute = segments.length <= 0;

    // Allow root route and auth group to pass through
    if (isRootRoute || inAuthGroup) {
      return;
    }

    // Redirect to auth if not authenticated
    if (!isAuthenticated) {
      router.replace('/(auth)/login' as any);
      return;
    }

    // Redirect to tabs if authenticated and in auth group
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)' as any);
      return;
    }
  }, [isAuthenticated, segments, router, isLoading]);

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
        name="(auth)" 
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
      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
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

  // Preload splash image
  useEffect(() => {
    async function loadSplashGif() {
      try {
        // Force preload the image
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
    // Wait for splash and fonts to be loaded
    if (!isSplashLoaded) return;
    
    console.log("Starting splash screen timer");
    
    // Show splash screen for at least 3 seconds (3000ms)
    const timer = setTimeout(() => {
      console.log("Splash timer complete, starting fade out");
      // Start fade-out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // After fade-out, set splash ready
        console.log("Fade complete, hiding splash screen");
        setSplashReady(true);
        SplashScreen.hideAsync().catch(e => console.log('Error hiding splash:', e));
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, isSplashLoaded]);

  // Add notification setup
  useEffect(() => {
    async function setupNotifications() {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
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
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    setupNotifications();
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <StatusBar style="light" />
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
          Error: {error}
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <Text style={{ color: '#fff', fontSize: 16 }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!isSplashReady || !isSplashLoaded) {
    return (
      <Animated.View style={{ flex: 1, backgroundColor: '#000000', opacity: fadeAnim }}>
        <StatusBar style="light" />
        <Image
          source={splashGif}
          style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
        />
      </Animated.View>
    );
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <AudioProvider>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <StatusBar style="light" />
            <RootLayoutNav />
          </View>
        </AudioProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}