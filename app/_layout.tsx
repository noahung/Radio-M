import React, { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const isRootRoute = segments.length === 0;

    // Allow root route and auth group to pass through
    if (isRootRoute || inAuthGroup) {
      return;
    }

    // Redirect to auth if not authenticated
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }

    // Redirect to tabs if authenticated and in auth group
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
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
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    try {
      if (fontsLoaded || fontError) {
        setIsReady(true);
        await SplashScreen.hideAsync();
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