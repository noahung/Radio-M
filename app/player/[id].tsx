import { View, Text, StyleSheet, TouchableOpacity, Modal, Share, Alert, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stations } from '../../data/stations';
import Slider from '@react-native-community/slider';
import { useAudio } from '../contexts/AudioContext';

const SLEEP_TIMER_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes', value: 60 },
  { label: 'End of track', value: 'track' },
] as const;

const AUDIO_ERROR_MESSAGES = {
  NETWORK: {
    title: 'Network Error',
    message: 'Unable to connect to the radio stream. Please check your internet connection and try again.',
    retry: true,
  },
  LOADING: {
    title: 'Loading Error',
    message: 'Failed to load the audio stream. The station might be temporarily unavailable.',
    retry: true,
  },
  PLAYBACK: {
    title: 'Playback Error',
    message: 'There was an error playing the audio. Please try again.',
    retry: true,
  },
  UNKNOWN: {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again later.',
    retry: false,
  },
};

export default function PlayerScreen() {
  const { id } = useLocalSearchParams();
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<Array<{ id: string; name: string; stationIds: string[] }>>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  
  const audioState = useAudio();
  const { sleepTimer, setSleepTimer } = audioState;

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const station = stations.find((s) => s.id === id);

  const loadSound = async () => {
    try {
      if (!station?.streamUrl) {
        throw new Error('Invalid station URL');
      }

      setIsBuffering(true);
      setError(null);
      
      // Unload existing sound if any
      if (audioState.sound) {
        await audioState.sound.unloadAsync();
        audioState.setSound(null);
      }
      
      // Create and load new sound with enhanced playback settings
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: station.streamUrl },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 1000,
          positionMillis: 0,
          volume: volume,
          isLooping: true,
          androidImplementation: 'MediaPlayer',
        },
        onPlaybackStatusUpdate
      );
      
      // Update global audio state
      audioState.setSound(newSound);
      audioState.setCurrentStation(station || null);
      audioState.setIsPlaying(true);
      
      setIsBuffering(false);
    } catch (error) {
      handleAudioError(error);
    }
  };

  const handleAudioError = (error: any) => {
    console.error('Audio error:', error);
    
    let errorType = 'UNKNOWN';
    if (error.message?.includes('network') || error.message?.includes('connection')) {
      errorType = 'NETWORK';
    } else if (error.message?.includes('load')) {
      errorType = 'LOADING';
    } else if (error.message?.includes('play')) {
      errorType = 'PLAYBACK';
    }

    const errorInfo = AUDIO_ERROR_MESSAGES[errorType as keyof typeof AUDIO_ERROR_MESSAGES];
    
    Alert.alert(
      errorInfo.title,
      errorInfo.message,
      [
        ...(errorInfo.retry ? [{
          text: 'Retry',
          onPress: async () => {
            try {
              setIsBuffering(true);
              if (audioState.sound) {
                await audioState.sound.unloadAsync();
                audioState.setSound(null);
              }
              await loadSound();
            } catch (retryError) {
              console.error('Error retrying:', retryError);
              handleAudioError(retryError);
            }
          },
        }] : []),
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );

    setIsBuffering(false);
    audioState.setSound(null);
    audioState.setCurrentStation(null);
    audioState.setIsPlaying(false);
  };

  useEffect(() => {
    if (!station) return;

    const loadInitialState = async () => {
      try {
        // Load favorite status
        const favorites = await AsyncStorage.getItem('favoriteStations');
        const favoriteIds = favorites ? JSON.parse(favorites) : [];
        setIsFavorite(favoriteIds.includes(station.id));

        // Load playlists
        const playlistsData = await AsyncStorage.getItem('playlists');
        if (playlistsData) {
          setPlaylists(JSON.parse(playlistsData));
        }
      } catch (error) {
        console.error('Error loading initial state:', error);
      }
    };

    // If the same station is already playing, don't reload audio
    if (audioState.currentStation?.id === station.id && audioState.sound) {
      loadInitialState();
      startTimeUpdate();
      return;
    }

    loadSound();
    loadInitialState();
    startTimeUpdate();

    return () => {
      // Don't unload sound when leaving the player screen
      // It will be handled by the tab layout when needed
    };
  }, [station]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setIsBuffering(status.isBuffering);
      if (status.error) {
        handleAudioError({ message: status.error });
      }
    } else if (status.error) {
      handleAudioError({ message: status.error });
    }
  };

  const startTimeUpdate = () => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  };

  const handlePlayPause = async () => {
    if (!audioState.sound) {
      setError('Audio not loaded. Please wait...');
      return;
    }

    try {
      const status = await audioState.sound.getStatusAsync();
      if (!status.isLoaded) {
        setError('Audio not loaded. Please wait...');
        return;
      }

      setIsBuffering(true);
      if (audioState.isPlaying) {
        await audioState.sound.pauseAsync();
        audioState.setIsPlaying(false);
      } else {
        await audioState.sound.playAsync();
        audioState.setIsPlaying(true);
      }
      setIsBuffering(false);
    } catch (error) {
      console.error('Error playing/pausing:', error);
      setError('Failed to play audio. Please try again.');
      setIsBuffering(false);
      audioState.setIsPlaying(false);
    }
  };

  const handleVolumeChange = async (value: number) => {
    setVolume(value);
    if (audioState.sound) {
      await audioState.sound.setVolumeAsync(value);
    }
  };

  const handleShare = async () => {
    try {
      if (!station) return;
      
      const shareMessage = `Listen to ${station.name} on Radio M!`;
      const shareUrl = `radiom://station/${station.id}`; // Deep link URL
      
      if (Platform.OS === 'web') {
        // For web, use the Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: station.name,
            text: shareMessage,
            url: shareUrl,
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          await navigator.clipboard.writeText(`${shareMessage}\n${shareUrl}`);
          Alert.alert('Success', 'Link copied to clipboard!');
        }
      } else {
        // For mobile platforms
        const result = await Share.share({
          message: `${shareMessage}\n${shareUrl}`,
          title: station.name,
        });
        
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            // Shared with activity type of result.activityType
            console.log('Shared with activity type:', result.activityType);
          } else {
            // Shared
            console.log('Shared successfully');
          }
        } else if (result.action === Share.dismissedAction) {
          // Dismissed
          console.log('Share dismissed');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert(
        'Share Error',
        'Unable to share at this time. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadPlaylists = async () => {
    try {
      const playlistsData = await AsyncStorage.getItem('playlists');
      if (playlistsData) {
        setPlaylists(JSON.parse(playlistsData));
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const createPlaylist = async (name: string) => {
    try {
      const newPlaylist = {
        id: Date.now().toString(),
        name,
        description: `Playlist created on ${new Date().toLocaleDateString()}`,
        stationIds: station?.id ? [station.id] : [],
        createdAt: new Date().toISOString()
      };
      const updatedPlaylists = [...playlists, newPlaylist];
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setShowPlaylistModal(false);
      Alert.alert('Success', 'Playlist created successfully');
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    try {
      const updatedPlaylists = playlists.map(playlist => {
        if (playlist.id === playlistId) {
          // Initialize stationIds array if it doesn't exist
          const currentStationIds = playlist.stationIds || [];
          // Only add if the station isn't already in the playlist
          if (!currentStationIds.includes(station?.id ?? '')) {
            return {
              ...playlist,
              stationIds: [...currentStationIds, station?.id ?? ''],
            };
          }
        }
        return playlist;
      });
      
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
      setShowPlaylistModal(false);
      Alert.alert('Success', 'Station added to playlist');
    } catch (error) {
      console.error('Error adding to playlist:', error);
      Alert.alert('Error', 'Failed to add station to playlist');
    }
  };

  const checkFavoriteStatus = async () => {
    if (!station) return;
    
    try {
      const favorites = await AsyncStorage.getItem('favoriteStations');
      const favoriteIds = favorites ? JSON.parse(favorites) : [];
      setIsFavorite(favoriteIds.includes(station.id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const addToFavorites = async (playlistId?: string) => {
    if (!station) return;
    
    try {
      const favorites = await AsyncStorage.getItem('favoriteStations');
      const favoriteIds = favorites ? JSON.parse(favorites) : [];
      
      if (!favoriteIds.includes(station.id)) {
        const updatedFavorites = [...favoriteIds, station.id];
        await AsyncStorage.setItem('favoriteStations', JSON.stringify(updatedFavorites));
        setIsFavorite(true);
      }

      // If playlistId is provided, add to that playlist as well
      if (playlistId) {
        const playlists = await AsyncStorage.getItem('playlists');
        const parsedPlaylists = playlists ? JSON.parse(playlists) : [];
        
        const updatedPlaylists = parsedPlaylists.map((playlist: any) => {
          if (playlist.id === playlistId && !playlist.stationIds.includes(station.id)) {
            return {
              ...playlist,
              stationIds: [...playlist.stationIds, station.id],
            };
          }
          return playlist;
        });

        await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
      }

      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!station) return;
    
    try {
      const favorites = await AsyncStorage.getItem('favoriteStations');
      const favoriteIds = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        Alert.alert(
          'Remove from Favorites',
          'Are you sure you want to remove this station from your favorites?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                const updatedFavorites = favoriteIds.filter((id: string) => id !== station.id);
                await AsyncStorage.setItem('favoriteStations', JSON.stringify(updatedFavorites));
                setIsFavorite(false);
              },
            },
          ]
        );
      } else {
        // Add to favorites immediately
        const updatedFavorites = [...favoriteIds, station.id];
        await AsyncStorage.setItem('favoriteStations', JSON.stringify(updatedFavorites));
        setIsFavorite(true);
        // Then show playlist modal
        setShowPlaylistModal(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatTime = useCallback((date: Date) => {
    const myanmarTime = new Date(date.getTime() + (6.5 * 60 * 60 * 1000));
    return myanmarTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  }, []);

  if (!fontsLoaded || !station) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25, 25, 112, 0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-down" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Now Playing</Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.albumArt}>
            {station.imageUrl ? (
              <Image
                source={station.imageUrl}
                style={styles.albumArtImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#FF1B6D', '#45D9D6']}
                style={styles.gradientBox}
              />
            )}
          </View>

          <View style={styles.stationInfo}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.stationDescription}>{station.description}</Text>
            <Text style={styles.myanmarTime}>Time in Myanmar: {formatTime(currentTime)}</Text>
          </View>

          <View style={styles.volumeControl}>
            <Ionicons name="volume-low" size={24} color="#fff" />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor="#FF1B6D"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#FF1B6D"
            />
            <Ionicons name="volume-high" size={24} color="#fff" />
          </View>

          {isBuffering && (
            <View style={styles.bufferingContainer}>
              <Text style={styles.bufferingText}>Buffering...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={toggleFavorite}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#FF1B6D' : '#fff'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              disabled={isBuffering}
            >
              <Ionicons
                name={audioState.isPlaying ? 'pause' : 'play'}
                size={32}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timerButton}
              onPress={() => setShowSleepTimerModal(true)}
            >
              <Ionicons
                name="timer-outline"
                size={24}
                color={audioState.sleepTimer ? '#FF1B6D' : '#fff'}
              />
              {audioState.sleepTimer && (
                <Text style={styles.timerText}>{audioState.sleepTimer}m</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Modal
        visible={showSleepTimerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSleepTimerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sleep Timer</Text>
            
            {SLEEP_TIMER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.timerOption}
                onPress={() => {
                  if (typeof option.value === 'number') {
                    audioState.startSleepTimer(option.value, volume);
                    setShowSleepTimerModal(false);
                  }
                }}
              >
                <Text style={styles.timerOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            {audioState.sleepTimer && (
              <TouchableOpacity
                style={[styles.timerOption, styles.cancelOption]}
                onPress={() => {
                  audioState.cancelSleepTimer();
                  setShowSleepTimerModal(false);
                }}
              >
                <Text style={[styles.timerOptionText, styles.cancelText]}>
                  Cancel Timer
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowSleepTimerModal(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Playlist</Text>
            
            <TouchableOpacity
              style={styles.createPlaylistButton}
              onPress={() => setIsCreatingPlaylist(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#FF1B6D" />
              <Text style={styles.createPlaylistText}>Create New Playlist</Text>
            </TouchableOpacity>

            {isCreatingPlaylist && (
              <View style={styles.createPlaylistForm}>
                <TextInput
                  style={styles.playlistNameInput}
                  placeholder="Enter playlist name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => {
                    if (newPlaylistName.trim()) {
                      createPlaylist(newPlaylistName);
                      setIsCreatingPlaylist(false);
                    }
                  }}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            )}

            {playlists.map(playlist => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistItem}
                onPress={() => addToPlaylist(playlist.id)}
              >
                <Text style={styles.playlistName}>{playlist.name}</Text>
                <Text style={styles.playlistCount}>
                  {(playlist.stationIds || []).length} stations
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => {
                setShowPlaylistModal(false);
                setIsCreatingPlaylist(false);
                setNewPlaylistName('');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 32,
  },
  albumArtImage: {
    width: '100%',
    height: '100%',
  },
  gradientBox: {
    width: '100%',
    height: '100%',
  },
  stationInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stationName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 8,
  },
  stationDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  myanmarTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  bufferingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bufferingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  errorContainer: {
    backgroundColor: 'rgba(255,27,109,0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FF1B6D',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    marginTop: 'auto',
  },
  actionButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF1B6D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 48,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  createPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  createPlaylistText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FF1B6D',
    marginLeft: 12,
  },
  playlistItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playlistName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  playlistCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 16,
  },
  modalCancelText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FF1B6D',
    textAlign: 'center',
  },
  createPlaylistForm: {
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#1A1A1A',
  },
  playlistNameInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#fff',
    height: 40,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1A1A1A',
  },
  createButton: {
    backgroundColor: '#FF1B6D',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
  timerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FF1B6D',
    marginTop: 2,
  },
  timerOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  timerOptionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
  cancelOption: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  cancelText: {
    color: '#FF1B6D',
  },
});