import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAudio } from '../(tabs)/_layout';

export default function MiniPlayer() {
  const audioState = useAudio();
  const { currentStation, isPlaying, sleepTimer } = audioState;

  if (!currentStation) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/player/${currentStation.id}`)}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.stationInfo}>
            <Text style={styles.stationName} numberOfLines={1}>
              {currentStation.name}
            </Text>
            <Text style={styles.stationDescription} numberOfLines={1}>
              {currentStation.description}
            </Text>
          </View>

          <View style={styles.controls}>
            {sleepTimer && (
              <View style={styles.timerContainer}>
                <Ionicons name="timer-outline" size={16} color="#FF1B6D" />
                <Text style={styles.timerText}>{sleepTimer}m</Text>
              </View>
            )}
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,27,109,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#FF1B6D',
  },
}); 