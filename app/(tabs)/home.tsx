import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions, Alert, ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { stations } from '../../data/stations';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '../contexts/AudioContext';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { BannerAd } from '../components/BannerAd';
import AdService from '../services/AdService';
import { GradientView } from '../components/GradientView';

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

const AVATAR_IMAGES: { [key: string]: any } = {
  'avatar1.png': require('../../assets/avatars/avatar1.png'),
  'avatar2.png': require('../../assets/avatars/avatar2.png'),
  'avatar3.png': require('../../assets/avatars/avatar3.png'),
  'avatar4.png': require('../../assets/avatars/avatar4.png'),
  'avatar5.png': require('../../assets/avatars/avatar5.png'),
  'avatar6.png': require('../../assets/avatars/avatar6.png'),
  'avatar7.png': require('../../assets/avatars/avatar7.png'),
  'avatar8.png': require('../../assets/avatars/avatar8.png'),
  'avatar9.png': require('../../assets/avatars/avatar9.png'),
  'avatar10.png': require('../../assets/avatars/avatar10.png'),
};

export default function HomeScreen() {
  const [stationsWithFavorites, setStationsWithFavorites] = useState<StationWithFavorites[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState('avatar1.png');
  const audioContext = useAudio();
  const routerNav = router;

  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random stations on initial load and when favorites change
  const randomizedStations = useMemo(() => {
    return shuffleArray(stationsWithFavorites);
  }, [stationsWithFavorites]);

  useEffect(() => {
    loadStationsWithFavorites();
    loadUserData();
    // Show interstitial ad when opening a station
    const showInterstitial = async () => {
      await AdService.getInstance().showInterstitialAd();
    };
    showInterstitial();
  }, []);

  const loadStationsWithFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem('favoriteStations') || '{}';
      const favorites = JSON.parse(favoritesData);
      
      // Create enhanced stations with favorites flag and randomize order
      const enhanced = shuffleArray(stations.map(station => ({
        ...station,
        isFavorite: favorites[station.id] || false
      })));
      
      setStationsWithFavorites(enhanced);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setStationsWithFavorites(shuffleArray(stations.map(station => ({
        ...station,
        isFavorite: false
      }))));
      setIsInitialized(true);
    }
  };

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const data = JSON.parse(userDataString);
        if (data.name) setUserName(data.name);
        if (data.avatar) setUserAvatar(data.avatar);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
      <GradientView
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
      </GradientView>
      <GradientView
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
      </GradientView>
    </TouchableOpacity>
  );

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
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
      <GradientView
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Listen to the sound of home</Text>
          </View>
        </View>

        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Stations</Text>
          <TouchableOpacity 
            style={styles.discoverButton}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text style={styles.discoverButtonText}>Discover More</Text>
            <Ionicons name="chevron-forward" size={16} color="#8f47ff" />
          </TouchableOpacity>
        </View>

        <BannerAd style={styles.bannerAd} />

        <FlatList
          data={randomizedStations}
          renderItem={renderStationCard}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.stationGrid}
          showsVerticalScrollIndicator={false}
        />
      </GradientView>
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
  featuredSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discoverButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#8f47ff',
    marginRight: 4,
  },
  stationGrid: {
    paddingBottom: 100, // Extra padding for mini player
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  stationCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: CARD_MARGIN,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stationName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  stationDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  bannerAd: {
    marginBottom: 16,
  },
}); 