import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Station } from '../../data/stations';
import { View } from 'react-native';

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
  isInitialized: boolean;
  togglePlayPause: () => Promise<void>;
  unloadAudio: () => Promise<void>;
};

const AudioContext = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalVolumeRef = useRef<number>(1);

  useEffect(() => {
    let mounted = true;

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize audio');
        }
      }
    };

    setupAudio();

    return () => {
      mounted = false;
      cancelSleepTimer();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

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
    if (sound) {
      sound.setVolumeAsync(originalVolumeRef.current);
    }
  };

  const startSleepTimer = (minutes: number, currentVolume: number) => {
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

        if (sound) {
          const fadeOutDuration = 5000;
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

  const togglePlayPause = async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const unloadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      cancelSleepTimer();
      setCurrentStation(null);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  };

  if (!isInitialized) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  if (error) {
    console.error('Audio initialization error:', error);
  }

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
        isInitialized,
        togglePlayPause,
        unloadAudio,
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

export default AudioProvider; 