import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { stations } from '../../data/stations';
import { StatusBar } from 'expo-status-bar';
import { BannerAd } from '../components/BannerAd';
import { GradientView } from '../components/GradientView';
import DarkModal from '../components/DarkModal';

type Playlist = {
  id: string;
  name: string;
  description: string;
  stationIds: string[];
  createdAt: string;
};

export default function LibraryScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favoriteStations, setFavoriteStations] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmText, setModalConfirmText] = useState('OK');
  const [modalShowCancel, setModalShowCancel] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const loadData = useCallback(async () => {
    try {
      // Load playlists
      const playlistsData = await AsyncStorage.getItem('playlists');
      if (playlistsData) {
        setPlaylists(JSON.parse(playlistsData));
      }

      // Load favorites
      const favoritesData = await AsyncStorage.getItem('favoriteStations');
      if (favoritesData) {
        const favoritesObj = JSON.parse(favoritesData);
        // Convert object to array of station IDs that are favorites
        const favoriteIds = Object.keys(favoritesObj).filter(id => favoritesObj[id]);
        setFavoriteStations(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {};
    }, [loadData])
  );

  const createNewPlaylist = async () => {
    setShowCreateModal(true);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setModalTitle('Error');
      setModalMessage('Please enter a playlist name');
      setModalConfirmText('OK');
      setModalShowCancel(false);
      setModalOnConfirm(undefined);
      setModalVisible(true);
      return;
    }

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      description: '',
      stationIds: [],
      createdAt: new Date().toISOString(),
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setShowCreateModal(false);
      setModalTitle('Success');
      setModalMessage('Playlist created successfully');
      setModalConfirmText('OK');
      setModalShowCancel(false);
      setModalOnConfirm(undefined);
      setModalVisible(true);
    } catch (error) {
      console.error('Error saving playlist:', error);
      setModalTitle('Error');
      setModalMessage('Failed to create playlist');
      setModalConfirmText('OK');
      setModalShowCancel(false);
      setModalOnConfirm(undefined);
      setModalVisible(true);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    setModalTitle('Delete Playlist');
    setModalMessage('Are you sure you want to delete this playlist?');
    setModalConfirmText('Delete');
    setModalShowCancel(true);
    setModalOnConfirm(() => async () => {
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
      try {
        await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
        setPlaylists(updatedPlaylists);
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
    });
    setModalVisible(true);
  };

  const getPlaylistStations = (stationIds: string[] | undefined) => {
    if (!stationIds) return [];
    return stations.filter(station => stationIds.includes(station.id));
  };

  const renderPlaylist = ({ item: playlist }: { item: Playlist }) => {
    const playlistStations = getPlaylistStations(playlist.stationIds);
    return (
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() => router.push(`/playlist/${playlist.id}`)}
      >
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.playlistDetails}>
            {playlistStations.length} stations
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => deletePlaylist(playlist.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFavoriteStation = ({ item: stationId }: { item: string }) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return null;

    return (
      <TouchableOpacity
        style={styles.stationItem}
        onPress={() => router.push(`/player/${stationId}`)}
      >
        {station.imageUrl && (
          <View style={styles.stationImageContainer}>
            <Image
              source={station.imageUrl}
              style={styles.stationImage}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={styles.stationInfo}>
          <Text style={styles.stationName}>{station.name}</Text>
          <Text style={styles.stationDescription} numberOfLines={1}>
            {station.description}
          </Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <GradientView
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Library</Text>
        </View>

        <BannerAd style={styles.bannerAd} />

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            {favoriteStations.length > 0 ? (
              <FlatList
                data={favoriteStations}
                renderItem={renderFavoriteStation}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.favoritesList}
              />
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No favorites yet</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playlists</Text>
            {playlists.length > 0 ? (
              <FlatList
                data={playlists}
                renderItem={renderPlaylist}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.playlistList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="library-outline" size={64} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyTitle}>No Playlists Yet</Text>
                <Text style={styles.emptyDescription}>
                  Create your first playlist by tapping the + button above
                </Text>
              </View>
            )}
          </View>
        </View>
      </GradientView>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter playlist name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setNewPlaylistName('');
                  setShowCreateModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreatePlaylist}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextCreate]}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,27,109,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistList: {
    flexGrow: 1,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playlistInfo: {
    flex: 1,
    marginRight: 16,
  },
  playlistName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  playlistDetails: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  deleteButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalButtonCreate: {
    backgroundColor: '#FF1B6D',
  },
  modalButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
  modalButtonTextCreate: {
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 16,
  },
  favoritesList: {
    paddingBottom: 8,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 250,
  },
  stationImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  stationImage: {
    width: '100%',
    height: '100%',
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  stationDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 61, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySection: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  bannerAd: {
    marginBottom: 16,
  },
}); 