import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView, Switch, Modal, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudio } from '../contexts/AudioContext';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../i18n/translations';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showWebViewModal, setShowWebViewModal] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  
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

  const handleLogoutConfirm = async () => {
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
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.gradient}
      >
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
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>andrew.ainsley@example.com</Text>
                {userData.status && (
                  <Text style={styles.userStatus}>
                    {userData.status} {userData.country?.flag || '🌍'}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.premiumCard}>
            <View style={styles.premiumTitleContainer}>
              <Ionicons name="cafe" size={24} color="#CDAF95" />
              <Text style={styles.premiumTitle}>Buy me a coffee!</Text>
            </View>
            <Text style={styles.premiumDescription}>Enjoying Radio M? Please support the fellow away-from-home burmese who developed this app. ❤️</Text>
            <TouchableOpacity 
              style={styles.premiumButton}
              onPress={() => setShowWebViewModal(true)}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="logo-paypal" size={18} color="#fff" />
                <Text style={styles.premiumButtonText}>Support Developer</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/edit' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="person-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.menuTitle}>{t.editProfile}</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="notifications-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.menuTitle}>{t.notifications}</Text>
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
                <Ionicons name="globe-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.menuTitle}>{t.language}</Text>
              <View style={styles.languageInfo}>
                <Text style={styles.languageText}>
                  {language === 'en' ? 'English' : 'မြန်မာ'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
          
          {/* Bottom padding to ensure logout button is visible with mini player */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutModalButton]}
                onPress={() => {
                  setShowLogoutModal(false);
                  handleLogoutConfirm();
                }}
              >
                <Text style={styles.logoutModalButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PayPal WebView Modal */}
      <Modal
        visible={showWebViewModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowWebViewModal(false)}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity 
              style={styles.webViewCloseButton}
              onPress={() => setShowWebViewModal(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>Support Developer</Text>
            <View style={styles.webViewHeaderSpacer} />
          </View>
          
          <WebView
            source={{ uri: 'https://www.paypal.com/paypalme/noahaung' }}
            style={styles.webView}
            onLoadStart={() => setIsWebViewLoading(true)}
            onLoadEnd={() => setIsWebViewLoading(false)}
          />
          
          {isWebViewLoading && (
            <View style={styles.webViewLoadingContainer}>
              <ActivityIndicator size="large" color="#8B3DFF" />
            </View>
          )}
        </View>
      </Modal>
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
  scrollContainer: {
    flex: 1,
    padding: 24,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    marginTop: 48,
    marginBottom: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B3DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  userStatus: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  premiumCard: {
    backgroundColor: 'rgba(114, 77, 55, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(205, 175, 149, 0.3)',
  },
  premiumTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#fff',
    marginLeft: 8,
  },
  premiumDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: '#8B3DFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    backgroundColor: 'rgba(255,27,109,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FF1B6D',
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FF1B6D',
    marginBottom: 12,
  },
  modalMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#fff',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logoutModalButton: {
    backgroundColor: '#8B3DFF',
  },
  cancelButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
  logoutModalButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  webViewTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#fff',
  },
  webViewCloseButton: {
    padding: 8,
  },
  webViewHeaderSpacer: {
    width: 40, // Same width as close button for balance
  },
  webView: {
    flex: 1,
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});