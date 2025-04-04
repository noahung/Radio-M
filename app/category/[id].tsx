import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { stations } from '../../data/stations';

type Station = typeof stations[0];

// Define category keywords for better filtering
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'news': ['news', 'updates', 'current events', 'information'],
  'music': ['music', 'songs', 'hits', 'playlist', 'tracks', 'songs'],
  'talk': ['talk', 'discussion', 'conversation', 'shows', 'programs'],
  'sports': ['sports', 'football', 'soccer', 'basketball', 'games', 'matches'],
  'religious': ['religious', 'spiritual', 'gospel', 'buddhist', 'christian', 'meditation'],
  'local': ['local', 'community', 'regional', 'area', 'city'],
  'entertainment': ['entertainment', 'fun', 'comedy', 'shows', 'programs'],
  'education': ['education', 'learning', 'teaching', 'academic', 'school'],
  'business': ['business', 'economy', 'finance', 'market', 'trading'],
  'culture': ['culture', 'cultural', 'traditional', 'heritage', 'arts'],
};

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams();
  const categoryName = name?.toString().toLowerCase() ?? '';
  const keywords = CATEGORY_KEYWORDS[categoryName] || [categoryName];

  const categoryStations = stations.filter(station => {
    const searchText = `${station.name} ${station.description}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword));
  });

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const renderStationItem = ({ item }: { item: Station }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => router.push(`/player/${item.id}`)}
    >
      {item.imageUrl && (
        <Image
          source={item.imageUrl}
          style={styles.stationImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.stationInfo}>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#000', '#1A1A1A']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.placeholder} />
      </View>

      {categoryStations.length > 0 ? (
        <FlatList
          data={categoryStations}
          renderItem={renderStationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.stationList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="radio-outline" size={64} color="rgba(255,255,255,0.2)" />
          <Text style={styles.emptyStateText}>No stations in this category</Text>
          <Text style={styles.emptyStateSubtext}>
            Check back later for updates
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  stationList: {
    padding: 24,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  stationDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF1B6D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
}); 