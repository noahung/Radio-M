import React, { useCallback, useState, memo, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { router } from 'expo-router';
import { stations, Station } from '../../data/stations';

// Reduced sizes for better performance
const ITEM_WIDTH = 140;
const ITEM_MARGIN = 8;
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + ITEM_MARGIN;

interface StationCardProps {
  station: Station;
  onPress: (id: string) => void;
}

// Optimized card component with pure component rendering
const PopularStationCard = memo(({ station, onPress }: StationCardProps) => (
  <TouchableOpacity
    style={[styles.popularStationCard, { width: ITEM_WIDTH }]}
    onPress={() => onPress(station.id)}
    activeOpacity={0.7}
  >
    {station.imageUrl && (
      <Image
        source={station.imageUrl}
        style={styles.popularStationImage}
        resizeMode="cover"
      />
    )}
    <Text style={styles.popularStationName} numberOfLines={1}>{station.name}</Text>
    <Text style={styles.popularStationDescription} numberOfLines={1}>
      {station.description}
    </Text>
  </TouchableOpacity>
));

const StationListItem = memo(({ station, onPress }: StationCardProps) => (
  <TouchableOpacity
    style={styles.stationItem}
    onPress={() => onPress(station.id)}
    activeOpacity={0.7}
  >
    {station.imageUrl && (
      <Image
        source={station.imageUrl}
        style={styles.stationImage}
        resizeMode="cover"
      />
    )}
    <View style={styles.stationInfo}>
      <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
      <Text style={styles.stationDescription} numberOfLines={1}>{station.description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
  </TouchableOpacity>
));

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(stations);

  // Get popular stations (you might want to implement your own logic for this)
  const popularStations = useMemo(() => stations.slice(0, 5), []);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(stations);
      return;
    }

    const filteredStations = stations.filter(station => 
      station.name.toLowerCase().includes(query.toLowerCase()) ||
      station.description.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredStations);
  }, []);

  const navigateToStation = useCallback((stationId: string) => {
    router.push(`/player/${stationId}`);
  }, []);

  const renderPopularStation = useCallback(({ item }: { item: Station }) => (
    <PopularStationCard station={item} onPress={navigateToStation} />
  ), [navigateToStation]);

  const renderStationItem = useCallback(({ item }: { item: Station }) => (
    <StationListItem station={item} onPress={navigateToStation} />
  ), [navigateToStation]);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: ITEM_TOTAL_WIDTH,
    offset: ITEM_TOTAL_WIDTH * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: Station) => item.id, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
          overScrollMode="never"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Discover</Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stations..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            ) : null}
          </View>

          {!searchQuery && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular & Trending Stations</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                horizontal
                data={popularStations}
                renderItem={renderPopularStation}
                keyExtractor={keyExtractor}
                showsHorizontalScrollIndicator={false}
                style={styles.popularStationsContainer}
                contentContainerStyle={styles.popularStationsContent}
                snapToInterval={ITEM_TOTAL_WIDTH}
                decelerationRate="fast"
                getItemLayout={getItemLayout}
                initialNumToRender={3}
                maxToRenderPerBatch={3}
                windowSize={3}
                removeClippedSubviews={true}
                snapToAlignment="start"
                scrollEventThrottle={16}
                bounces={false}
                overScrollMode="never"
              />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Stations</Text>
              </View>
            </>
          )}

          <FlatList
            data={searchResults}
            renderItem={renderStationItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            initialNumToRender={6}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={true}
            overScrollMode="never"
          />
        </ScrollView>
      </LinearGradient>
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
  scrollContent: {
    paddingBottom: 100, // Add some padding at the bottom for the mini-player
  },
  header: {
    marginTop: 60,
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginLeft: 12,
  },
  clearButton: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  seeAll: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FF1B6D',
  },
  popularStationsContainer: {
    marginBottom: 24,
    height: ITEM_WIDTH + 48,
  },
  popularStationsContent: {
    paddingRight: 16,
  },
  popularStationCard: {
    marginRight: ITEM_MARGIN,
  },
  popularStationImage: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 8,
    marginBottom: 6,
  },
  popularStationName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#fff',
    marginBottom: 2,
  },
  popularStationDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  stationsList: {
    flex: 1,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  stationImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 14,
  },
  stationInfo: {
    flex: 1,
    marginRight: 12,
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
}); 