import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BannerAdProps {
  style?: object;
}

export function BannerAd({ style }: BannerAdProps) {
  // This is a placeholder component that will be replaced with the actual AdMob implementation later
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Ad Space</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  text: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
}); 