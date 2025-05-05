import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import MiniPlayer from '../components/MiniPlayer';
import { useAudio } from '../contexts/AudioContext';

export default function TabLayout() {
  const audioState = useAudio();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#8B3DFF',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="donate"
          options={{
            title: 'Donate',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {audioState.currentStation && <MiniPlayer />}
    </View>
  );
}