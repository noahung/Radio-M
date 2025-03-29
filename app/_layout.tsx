import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SplashScreen } from 'expo-router';
import { AudioProvider } from './(tabs)/_layout';
import { SettingsProvider } from './contexts/SettingsContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleBackPress = () => {
    const currentSegment = segments[segments.length - 1];
    
    // If we're in a modal or detail screen
    if (currentSegment === 'player' || currentSegment === 'playlist' || currentSegment === 'category') {
      router.back();
    } else if (currentSegment === '(tabs)') {
      // If we're in the main tabs, we might want to handle this differently
      // For example, show a confirmation dialog before exiting
      router.back();
    } else {
      // For other screens, just go back
      router.back();
    }
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SettingsProvider>
      <AudioProvider>
        <Stack screenOptions={{ 
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          animation: 'slide_from_right',
        }}>
          <Stack.Screen 
            name="welcome" 
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
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }} 
          />
          <Stack.Screen 
            name="playlist/[id]" 
            options={{ 
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }} 
          />
          <Stack.Screen 
            name="category/[id]" 
            options={{ 
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right',
            }} 
          />
        </Stack>
        <StatusBar style="light" />
      </AudioProvider>
    </SettingsProvider>
  );
}