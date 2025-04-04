import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAudio } from '../contexts/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFonts, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function MiniPlayer() {
  const { 
    currentStation, 
    isPlaying, 
    togglePlayPause,
    unloadAudio
  } = useAudio();
  
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold
  });

  if (!fontsLoaded || !currentStation) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.95}
      onPress={() => router.push(`/player/${currentStation.id}`)}
    >
      <View style={styles.playerContent}>
        {currentStation.imageUrl && (
          <Image 
            source={currentStation.imageUrl} 
            style={styles.stationImage}
          />
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.stationName} numberOfLines={1}>
            {currentStation.name}
          </Text>
          <Text style={styles.stationDescription} numberOfLines={1}>
            {currentStation.description}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={(e) => {
              e.stopPropagation();
              unloadAudio();
            }}
          >
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 65, // Above tab bar
    left: 0,
    right: 0,
    backgroundColor: '#1F1F24',
    borderRadius: 8,
    margin: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  stationImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  stationName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  stationDescription: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,27,109,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
}); 