import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Alert, ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { stations } from '../../data/stations';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - 48 - CARD_MARGIN * 2) / 2; // 48 for container padding

type StationWithFavorites = {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  imageUrl?: ImageSourcePropType;
  isFavorite: boolean;
};

export default function HomeScreen() {
  const [stationsWithFavorites, setStationsWithFavorites] = useState<StationWithFavorites[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    loadStationsWithFavorites();
  }, []);

  const loadStationsWithFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem('favoriteStations') || '{}';
      const favorites = JSON.parse(favoritesData);
      
      const enhanced = stations.map(station => ({
        ...station,
        isFavorite: favorites[station.id] || false
      }));
      
      setStationsWithFavorites(enhanced);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setStationsWithFavorites(stations.map(station => ({
        ...station,
        isFavorite: false
      })));
      setIsInitialized(true);
    }
  };

  const toggleFavorite = async (stationId: string) => {
    try {
      const favoritesData = await AsyncStorage.getItem('favoriteStations') || '{}';
      const favorites = JSON.parse(favoritesData);
      
      const newFavorites = {
        ...favorites,
        [stationId]: !favorites[stationId]
      };
      
      await AsyncStorage.setItem('favoriteStations', JSON.stringify(newFavorites));
      
      setStationsWithFavorites(prev => 
        prev.map(station => 
          station.id === stationId 
            ? { ...station, isFavorite: !station.isFavorite }
            : station
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const renderStationCard = ({ item }: { item: StationWithFavorites }) => (
    <TouchableOpacity
      style={styles.stationCard}
      onPress={() => router.push(`/player/${item.id}`)}
    >
      <LinearGradient
        colors={['rgba(255,27,109,0.8)', 'rgba(69,39,160,0.8)']}
        style={styles.cardBackground}
      >
        {item.imageUrl ? (
          <Image
            source={item.imageUrl}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : null}
      </LinearGradient>
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
        >
          <Ionicons 
            name={item.isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isFavorite ? "#FF1B6D" : "#fff"} 
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.stationName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.stationDescription} numberOfLines={2}>{item.description}</Text>
        </View>
        <View style={styles.playButton}>
          <Ionicons name="play" size={24} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (!fontsLoaded || !isInitialized) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Loading...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello Miau</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://placekitten.com/40/40' }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>All Stations</Text>
      <FlatList
        data={stationsWithFavorites}
        renderItem={renderStationCard}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.stationGrid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
  },
  stationGrid: {
    paddingBottom: 100, // Extra padding for mini player
  },
  row: {
    justifyContent: 'space-between',
  },
  stationCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,27,109,0.8)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stationName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
  },
  stationDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 