import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, AlertButton, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { stations } from '../../data/stations';
import DarkModal from '../components/DarkModal';

type Playlist = {
  id: string;
  name: string;
  description: string;
  stationIds: string[];
  createdAt: string;
};

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmText, setModalConfirmText] = useState('OK');
  const [modalShowCancel, setModalShowCancel] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = async () => {
    try {
      setIsLoading(true);
      const playlistsData = await AsyncStorage.getItem('playlists');
      if (playlistsData) {
        const playlists: Playlist[] = JSON.parse(playlistsData);
        const foundPlaylist = playlists.find(p => p.id === id);
        if (foundPlaylist) {
          setPlaylist(foundPlaylist);
        } else {
          setModalTitle('Error');
          setModalMessage('Playlist not found');
          setModalConfirmText('OK');
          setModalShowCancel(false);
          setModalOnConfirm(undefined);
          setModalVisible(true);
          router.back();
        }
      } else {
        setModalTitle('Error');
        setModalMessage('No playlists found');
        setModalConfirmText('OK');
        setModalShowCancel(false);
        setModalOnConfirm(undefined);
        setModalVisible(true);
        router.back();
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      setModalTitle('Error');
      setModalMessage('Failed to load playlist');
      setModalConfirmText('OK');
      setModalShowCancel(false);
      setModalOnConfirm(undefined);
      setModalVisible(true);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const addStation = async () => {
    if (!playlist) return;

    const availableStations = stations.filter(station => !playlist.stationIds.includes(station.id));
    if (availableStations.length === 0) {
      setModalTitle('No Stations Available');
      setModalMessage('All stations are already in this playlist.');
      setModalConfirmText('OK');
      setModalShowCancel(false);
      setModalOnConfirm(undefined);
      setModalVisible(true);
      return;
    }

    const buttons: AlertButton[] = [
      ...availableStations.map(station => ({
        text: station.name,
        onPress: async () => {
          try {
            const playlistsData = await AsyncStorage.getItem('playlists');
            if (playlistsData) {
              const playlists: Playlist[] = JSON.parse(playlistsData);
              const updatedPlaylists = playlists.map(p => {
                if (p.id === playlist.id) {
                  return {
                    ...p,
                    stationIds: [...p.stationIds, station.id],
                  };
                }
                return p;
              });
              await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
              loadPlaylist();
            }
          } catch (error) {
            console.error('Error adding station:', error);
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' }
    ];

    setModalTitle('Add Station');
    setModalMessage('Select a station to add:');
    setModalConfirmText('OK');
    setModalShowCancel(false);
    setModalOnConfirm(undefined);
    setModalVisible(true);
  };

  const removeStation = async (stationId: string) => {
    if (!playlist) return;

    setModalTitle('Remove Station');
    setModalMessage('Are you sure you want to remove this station from the playlist?');
    setModalConfirmText('Remove');
    setModalShowCancel(true);
    setModalOnConfirm(() => async () => {
      try {
        const playlistsData = await AsyncStorage.getItem('playlists');
        if (playlistsData) {
          const playlists: Playlist[] = JSON.parse(playlistsData);
          const updatedPlaylists = playlists.map(p => {
            if (p.id === playlist.id) {
              return {
                ...p,
                stationIds: p.stationIds.filter(id => id !== stationId),
              };
            }
            return p;
          });
          await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
          loadPlaylist();
        }
      } catch (error) {
        console.error('Error removing station:', error);
      }
    });
    setModalVisible(true);
  };

  const renderStation = ({ item: stationId }: { item: string }) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return null;

    return (
      <View style={styles.stationItem}>
        {station.imageUrl && (
          <Image
            source={station.imageUrl}
            style={styles.stationImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.stationDescription} numberOfLines={1}>
            {station.description}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => removeStation(station.id)}
          style={styles.removeButton}
        >
          <Ionicons name="remove-circle-outline" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>
    );
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF1B6D" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{playlist.name}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addStation}
            >
              <Ionicons name="add" size={24} color="#FF1B6D" />
            </TouchableOpacity>
          </View>

          {playlist.stationIds && playlist.stationIds.length > 0 ? (
            <FlatList
              data={playlist.stationIds}
              renderItem={renderStation}
              keyExtractor={item => item}
              contentContainerStyle={styles.stationList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="radio-outline" size={64} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyTitle}>No Stations</Text>
              <Text style={styles.emptyDescription}>
                Add stations to your playlist by tapping the + button above
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
      <DarkModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        confirmText={modalConfirmText}
        showCancel={modalShowCancel}
        onClose={() => setModalVisible(false)}
        onConfirm={() => {
          if (modalOnConfirm) modalOnConfirm();
          setModalVisible(false);
        }}
      />
    </View>
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
  },
  header: {
    marginTop: 60,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#fff',
    marginHorizontal: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,27,109,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationList: {
    flexGrow: 1,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  stationImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  stationInfo: {
    flex: 1,
    marginRight: 16,
  },
  stationName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  stationDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 