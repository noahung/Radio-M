import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { useState, useEffect, createContext, useContext, useRef } from 'react';
import MiniPlayer from '../components/MiniPlayer';
import { Audio } from 'expo-av';
import { Station } from '../../data/stations';

type AudioState = {
  sound: Audio.Sound | null;
  currentStation: Station | null;
  isPlaying: boolean;
  setSound: (sound: Audio.Sound | null) => void;
  setCurrentStation: (station: Station | null) => void;
  setIsPlaying: (playing: boolean) => void;
  sleepTimer: number | null;
  setSleepTimer: (minutes: number | null) => void;
  startSleepTimer: (minutes: number, currentVolume: number) => void;
  cancelSleepTimer: () => void;
};

const AudioContext = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalVolumeRef = useRef<number>(1);

  const cancelSleepTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    setSleepTimer(null);
    // Restore original volume if we were in the middle of fading
    if (sound) {
      sound.setVolumeAsync(originalVolumeRef.current);
    }
  };

  const startSleepTimer = (minutes: number, currentVolume: number) => {
    // Cancel any existing timer
    cancelSleepTimer();

    const endTime = Date.now() + minutes * 60 * 1000;
    setSleepTimer(minutes);
    originalVolumeRef.current = currentVolume;

    timerRef.current = setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000 / 60);
      
      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setSleepTimer(null);

        // Start fade out
        if (sound) {
          const fadeOutDuration = 5000; // 5 seconds
          const steps = 50;
          const stepDuration = fadeOutDuration / steps;
          const volumeStep = currentVolume / steps;
          let currentStep = 0;

          fadeIntervalRef.current = setInterval(async () => {
            if (currentStep >= steps) {
              if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
              }
              await sound.pauseAsync();
              setIsPlaying(false);
              // Restore original volume for next play
              await sound.setVolumeAsync(originalVolumeRef.current);
            } else {
              const newVolume = currentVolume - (volumeStep * currentStep);
              await sound.setVolumeAsync(Math.max(0, newVolume));
              currentStep++;
            }
          }, stepDuration);
        }
      } else {
        setSleepTimer(remaining);
      }
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelSleepTimer();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <AudioContext.Provider
      value={{
        sound,
        currentStation,
        isPlaying,
        setSound,
        setCurrentStation,
        setIsPlaying,
        sleepTimer,
        setSleepTimer,
        startSleepTimer,
        cancelSleepTimer,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default function TabLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const audioState = useAudio();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#FF1B6D',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'All Stations',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}