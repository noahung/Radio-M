import React, { useEffect, useCallback, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';
import { AudioProvider } from './contexts/AudioContext';
import { SettingsProvider } from './contexts/SettingsContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

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
    <SettingsProvider>
      <AudioProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar style="light" />
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
              name="login" 
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
        </View>
      </AudioProvider>
    </SettingsProvider>
  );
}