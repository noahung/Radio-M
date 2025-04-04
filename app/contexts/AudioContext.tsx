import { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Station } from '../../data/stations';
import { View, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import * as MediaLibrary from 'expo-media-library';
import {
  configureAudioSession,
  showPlaybackNotification,
  dismissPlaybackNotification,
  setupNotificationHandlers
} from '../services/AudioService';

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
  const notificationListenerRef = useRef<any>(null);

  // Setup initial audio mode and notification handlers
  useEffect(() => {
    let mounted = true;

    const setupAudio = async () => {
      try {
        // Request permissions if on iOS
        if (Platform.OS === 'ios') {
          await MediaLibrary.requestPermissionsAsync();
        }

        // Configure audio session with our service
        const configured = await configureAudioSession();
        
        if (mounted && configured) {
          setIsInitialized(true);
        }
        
        // Setup notification handlers for media controls
        notificationListenerRef.current = setupNotificationHandlers(
          // Play
          async () => {
            if (sound) {
              await sound.playAsync();
              setIsPlaying(true);
              updateNotification();
            }
          },
          // Pause
          async () => {
            if (sound) {
              await sound.pauseAsync();
              setIsPlaying(false);
              updateNotification();
            }
          },
          // Stop
          async () => {
            unloadAudio();
          }
        );
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
      dismissNotification();
      
      // Clean up notification handler
      if (notificationListenerRef.current) {
        notificationListenerRef.current.remove();
      }
    };
  }, []);

  // Update notification when current station or playback state changes
  useEffect(() => {
    updateNotification();
  }, [currentStation, isPlaying]);

  const updateNotification = async () => {
    if (currentStation && isPlaying) {
      // Show playback notification with station info
      await showPlaybackNotification(
        currentStation.name,
        currentStation.description,
        isPlaying
      );
    } else if (!isPlaying && currentStation) {
      // Update notification to paused state
      await showPlaybackNotification(
        currentStation.name,
        'Paused - ' + currentStation.description,
        false
      );
    } else {
      // No station or not playing, dismiss notification
      await dismissNotification();
    }
  };

  const dismissNotification = async () => {
    await dismissPlaybackNotification();
  };

  // Media session API for web platforms
  useEffect(() => {
    if (Platform.OS === 'web') {
      if (currentStation) {
        updateMediaSessionMetadata(currentStation);
      } else {
        clearMediaSession();
      }
    }
  }, [currentStation]);

  // Update media session playback state when isPlaying changes (web only)
  useEffect(() => {
    if (Platform.OS === 'web') {
      updateMediaSessionPlaybackState();
    }
  }, [isPlaying]);

  const updateMediaSessionMetadata = async (station: Station) => {
    if (!station || Platform.OS !== 'web') return;

    try {
      // MediaSession API is only available on web
      if ('mediaSession' in navigator) {
        const artwork = [];
        
        if (station.imageUrl) {
          // Convert require() image to URL for Web
          let imageUrl = '';
          if (typeof station.imageUrl === 'number') {
            const asset = Asset.fromModule(station.imageUrl);
            await asset.downloadAsync();
            imageUrl = asset.uri || '';
          }
          
          if (imageUrl) {
            artwork.push({
              src: imageUrl,
              sizes: '512x512',
              type: 'image/png'
            });
          }
        }

        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: 'Radio M',
          album: station.description,
          artwork: artwork
        });

        // Set up action handlers
        navigator.mediaSession.setActionHandler('play', () => {
          togglePlayPause();
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          togglePlayPause();
        });
        
        navigator.mediaSession.setActionHandler('stop', () => {
          unloadAudio();
        });
      }
    } catch (error) {
      console.error('Error updating media session metadata:', error);
    }
  };

  const updateMediaSessionPlaybackState = () => {
    try {
      if (Platform.OS === 'web' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      }
    } catch (error) {
      console.error('Error updating media session playback state:', error);
    }
  };

  const clearMediaSession = () => {
    try {
      if (Platform.OS === 'web' && 'mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
      }
    } catch (error) {
      console.error('Error clearing media session:', error);
    }
  };

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
              updateNotification();
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
      updateNotification();
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
      dismissNotification();
      clearMediaSession();
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