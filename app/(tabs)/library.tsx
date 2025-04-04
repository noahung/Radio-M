import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { stations } from '../../data/stations';

type Playlist = {
  id: string;
  name: string;
  description: string;
  stationIds: string[];
  createdAt: string;
};

export default function LibraryScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    loadPlaylists();
  }, []);

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

  const createNewPlaylist = async () => {
    setShowCreateModal(true);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
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
      Alert.alert('Success', 'Playlist created successfully');
    } catch (error) {
      console.error('Error saving playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
            try {
              await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
              setPlaylists(updatedPlaylists);
            } catch (error) {
              console.error('Error deleting playlist:', error);
            }
          },
        },
      ]
    );
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

  if (!fontsLoaded) {
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
            <Text style={styles.headerTitle}>Library</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={createNewPlaylist}
            >
              <Ionicons name="add" size={24} color="#FF1B6D" />
            </TouchableOpacity>
          </View>

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
      </LinearGradient>

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
  headerTitle: {
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
}); 