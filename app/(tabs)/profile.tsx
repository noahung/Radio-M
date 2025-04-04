import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '../contexts/AudioContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../i18n/translations';

interface UserData {
  name: string;
  status?: string;
  country?: {
    name: string;
    code: string;
    flag: string;
  };
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<UserData>({
    name: "Andrew Ainsley",
    status: "Music lover and radio enthusiast 🎧",
    country: {
      name: "United States",
      code: "US",
      flag: "🇺🇸"
    }
  });
  
  const routerNav = router;
  const audioContext = useAudio();
  const { language, theme, setLanguage, setTheme } = useSettings();
  const t = translations[language]; // Get translations based on current language
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  
  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);
  
  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const data = JSON.parse(userDataString);
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  const loadSettings = async () => {
    try {
      const notificationsValue = await AsyncStorage.getItem('notifications');
      setNotificationsEnabled(notificationsValue === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  const toggleNotifications = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('notifications', value.toString());
      setNotificationsEnabled(value);
    } catch (error) {
      console.error('Error saving notification setting:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };
  
  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme setting:', error);
      Alert.alert('Error', 'Failed to update theme settings');
    }
  };

  const handleLogout = async () => {
    try {
      // Stop any playing audio
      if (audioContext.currentStation) {
        await audioContext.unloadAudio();
      }
      
      // Clear stored data
      await AsyncStorage.clear();
      
      // Navigate to login
      router.replace('/login' as any);
    } catch (error) {
      Alert.alert('Logout Error', 'An error occurred while logging out.');
      console.error(error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, theme === 'light' && { backgroundColor: '#F5F5F7' }]}>
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/avatars/avatar1.png')}
                style={styles.avatar}
              />
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="#fff" />
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[styles.userName, theme === 'light' && styles.lightText]}>{userData.name}</Text>
              <Text style={[styles.userEmail, theme === 'light' && styles.lightSubtext]}>andrew.ainsley@example.com</Text>
              {userData.status && (
                <Text style={[styles.userStatus, theme === 'light' && styles.lightSubtext]}>
                  {userData.status} {userData.country?.flag || '🌍'}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={[styles.premiumCard, theme === 'light' && styles.lightPremiumCard]}>
          <Text style={[styles.premiumTitle, theme === 'light' && styles.lightText]}>{t.enjoyAllBenefits}</Text>
          <Text style={[styles.premiumDescription, theme === 'light' && styles.lightSubtext]}>{t.getUnlimitedAccess}</Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>{t.getPremium}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.menuContainer, theme === 'light' && styles.lightMenuContainer]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-outline" size={22} color={theme === 'dark' ? "#fff" : "#000"} />
            </View>
            <Text style={[styles.menuTitle, theme === 'light' && styles.lightText]}>{t.editProfile}</Text>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications-outline" size={22} color={theme === 'dark' ? "#fff" : "#000"} />
            </View>
            <Text style={[styles.menuTitle, theme === 'light' && styles.lightText]}>{t.notifications}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: '#8f47ff' }}
              thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/profile/language' as any)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="globe-outline" size={22} color={theme === 'dark' ? "#fff" : "#000"} />
            </View>
            <Text style={[styles.menuTitle, theme === 'light' && styles.lightText]}>{t.language}</Text>
            <View style={styles.languageInfo}>
              <Text style={[styles.languageText, theme === 'light' && styles.lightSubtext]}>
                {language === 'en' ? 'English' : 'မြန်မာ'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"} />
            </View>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name={theme === 'dark' ? "moon-outline" : "sunny-outline"} size={22} color={theme === 'dark' ? "#fff" : "#000"} />
            </View>
            <Text style={[styles.menuTitle, theme === 'light' && styles.lightText]}>{t.darkMode}</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#8f47ff' }}
              thumbColor={theme === 'dark' ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.logoutButton, theme === 'light' && styles.lightLogoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>
        
        {/* Bottom padding to ensure logout button is visible with mini player */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Extra padding to ensure content is visible with mini player
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF1B6D',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#fff',
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  userStatus: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  premiumCard: {
    backgroundColor: '#1F1F24',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  premiumTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  premiumDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: '#FF1B6D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  menuContainer: {
    backgroundColor: '#1F1F24',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuIconContainer: {
    width: 24,
    marginRight: 16,
  },
  menuTitle: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: '#1F1F24',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FF3B30',
  },
  bottomPadding: {
    height: 80, // Extra padding at bottom
  },
  // Light mode styles
  lightText: {
    color: '#000',
  },
  lightSubtext: {
    color: 'rgba(0,0,0,0.6)',
  },
  lightPremiumCard: {
    backgroundColor: '#F0F0F5',
  },
  lightMenuContainer: {
    backgroundColor: '#F0F0F5',
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  lightLogoutButton: {
    backgroundColor: '#F0F0F5',
  }
});