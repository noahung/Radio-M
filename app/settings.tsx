import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type SettingItem = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'toggle' | 'select' | 'action';
  value?: boolean;
  action?: () => void;
};

export default function SettingsScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'notifications',
      title: 'Push Notifications',
      description: 'Receive updates about new stations and features',
      icon: 'notifications-outline',
      type: 'toggle',
      value: true,
    },
    {
      id: 'highQuality',
      title: 'High Quality Audio',
      description: 'Stream in higher quality (uses more data)',
      icon: 'musical-notes-outline',
      type: 'toggle',
      value: false,
    },
    {
      id: 'darkMode',
      title: 'Dark Mode',
      description: 'Use dark theme throughout the app',
      icon: 'moon-outline',
      type: 'toggle',
      value: true,
    },
    {
      id: 'language',
      title: 'Language',
      description: 'Change app language',
      icon: 'language-outline',
      type: 'select',
      action: () => Alert.alert('Coming Soon', 'Language selection will be available in a future update'),
    },
    {
      id: 'about',
      title: 'About',
      description: 'App version and information',
      icon: 'information-circle-outline',
      type: 'action',
      action: () => Alert.alert('About', 'Radio M v1.0.0\n\nYour favorite radio streaming app'),
    },
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(settings.map(setting => ({
          ...setting,
          value: parsedSettings[setting.id] ?? setting.value,
        })));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleToggle = async (id: string) => {
    const newSettings = settings.map(setting => {
      if (setting.id === id) {
        return { ...setting, value: !setting.value };
      }
      return setting;
    });
    setSettings(newSettings);

    try {
      const settingsToSave = newSettings.reduce((acc, setting) => {
        if (setting.type === 'toggle' && setting.value !== undefined) {
          acc[setting.id] = setting.value;
        }
        return acc;
      }, {} as Record<string, boolean>);
      await AsyncStorage.setItem('appSettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25, 25, 112, 0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.settingsList}>
            {settings.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={styles.settingItem}
                onPress={() => setting.action?.()}
              >
                <View style={styles.settingItemLeft}>
                  <Ionicons name={setting.icon} size={24} color="#fff" />
                  <View style={styles.settingItemText}>
                    <Text style={styles.settingItemTitle}>{setting.title}</Text>
                    <Text style={styles.settingItemDescription}>{setting.description}</Text>
                  </View>
                </View>
                {setting.type === 'toggle' && (
                  <Switch
                    value={setting.value}
                    onValueChange={() => handleToggle(setting.id)}
                    trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#FF1B6D' }}
                    thumbColor="#fff"
                  />
                )}
                {(setting.type === 'select' || setting.type === 'action') && (
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 60,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  settingsList: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: {
    marginLeft: 16,
    flex: 1,
  },
  settingItemTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
}); 