import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { colors, typography } from '@/constants/theme';
import type { Station } from '@/types/station';

interface StationCardProps {
  station: Station;
  isPlaying?: boolean;
  onPress: () => void;
  onPlayPress: () => void;
}

export function StationCard({ station, isPlaying, onPress, onPlayPress }: StationCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: station.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{station.name}</Text>
        <Text style={styles.genre}>{station.genre}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={onPlayPress}>
        {isPlaying ? (
          <Pause color={colors.text} size={24} />
        ) : (
          <Play color={colors.text} size={24} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    ...typography.body,
    color: colors.text,
  },
  genre: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});