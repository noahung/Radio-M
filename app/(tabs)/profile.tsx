import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, FlatList, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useAudio } from '../contexts/AudioContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For now, we'll use placeholder avatars. Later, you should place avatar images in assets/avatars/
const AVATARS: ImageSourcePropType[] = [
  require('../../assets/avatars/avatar1.png'),
  require('../../assets/avatars/avatar2.png'),
  require('../../assets/avatars/avatar3.png'),
  require('../../assets/avatars/avatar4.png'),
  require('../../assets/avatars/avatar5.png'),
  require('../../assets/avatars/avatar6.png'),
];

type AppRoute = 
  | '/'  // Root/login route
  | '/profile/edit'
  | '/profile/notifications'
  | '/profile/downloads'
  | '/profile/content'
  | '/profile/security'
  | '/profile/language'
  | '/profile/help';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route?: AppRoute;
  value?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'edit', title: 'Edit Profile', icon: 'person-outline', route: '/profile/edit' },
  { id: 'notification', title: 'Notification', icon: 'notifications-outline', route: '/profile/notifications' },
  { id: 'downloads', title: 'Downloads', icon: 'download-outline', route: '/profile/downloads' },
  { id: 'content', title: 'Content Settings', icon: 'settings-outline', route: '/profile/content' },
  { id: 'security', title: 'Security', icon: 'shield-outline', route: '/profile/security' },
  { 
    id: 'language', 
    title: 'Language & Region', 
    icon: 'globe-outline', 
    value: 'English (US)',
    route: '/profile/language' 
  },
  { id: 'help', title: 'Help Center', icon: 'help-circle-outline', route: '/profile/help' },
];

export default function ProfileScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [userName] = useState('Andrew Ainsley');
  const [userEmail] = useState('andrew_ainsley@example.com');
  const [userStatus] = useState('Listening to Myanmar music 🎵');
  const [userCountry] = useState('🇺🇸');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const { sound, setSound, setCurrentStation, setIsPlaying } = useAudio();

  if (!fontsLoaded) {
    return null;
  }

  const handleMenuPress = (route?: string) => {
    if (route) {
      router.push(route);
    }
  };

  const handleLogout = async () => {
    try {
      // Stop any playing audio
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setCurrentStation(null);
        setIsPlaying(false);
      }

      // Clear any stored user data
      await AsyncStorage.clear();

      // Navigate to login screen
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still try to navigate to login even if there's an error
      router.replace('/login');
    }
  };

  const renderAvatarItem = ({ item, index }: { item: ImageSourcePropType; index: number }) => (
    <TouchableOpacity
      style={[
        styles.avatarItem,
        selectedAvatar === item && styles.selectedAvatarItem
      ]}
      onPress={() => {
        setSelectedAvatar(item);
        setAvatarModalVisible(false);
      }}
    >
      <Image source={item} style={styles.avatarOption} />
      {selectedAvatar === item && (
        <View style={styles.selectedAvatarCheck}>
          <Ionicons name="checkmark-circle" size={24} color="#FF1B6D" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.gradient}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => setAvatarModalVisible(true)}
            >
              <Image source={selectedAvatar} style={styles.avatar} />
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userFlag}>{userCountry}</Text>
              </View>
              <Text style={styles.userEmail}>{userEmail}</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.userStatus} numberOfLines={2}>{userStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.premiumCard}>
            <Text style={styles.premiumTitle}>Enjoy All Benefits!</Text>
            <Text style={styles.premiumDescription}>Get unlimited access to all features</Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Get Premium</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuContainer}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route)}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons name={item.icon as any} size={24} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.value ? (
                    <Text style={styles.menuItemValue}>{item.value}</Text>
                  ) : null}
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF1B6D" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <Modal
          visible={avatarModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAvatarModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Avatar</Text>
                <TouchableOpacity
                  onPress={() => setAvatarModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={AVATARS}
                renderItem={renderAvatarItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                style={styles.avatarGrid}
                contentContainerStyle={styles.avatarGridContent}
              />
            </View>
          </View>
        </Modal>
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
    marginTop: 60,
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: '#fff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FF1B6D',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#fff',
    marginRight: 8,
  },
  userFlag: {
    fontSize: 20,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userStatus: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontStyle: 'italic',
    flex: 1,
  },
  premiumCard: {
    backgroundColor: 'rgba(255,27,109,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  premiumTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 4,
  },
  premiumDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#FF1B6D',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  menuContainer: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  logoutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FF1B6D',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  avatarGrid: {
    padding: 12,
  },
  avatarGridContent: {
    paddingBottom: 24,
  },
  avatarItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedAvatarItem: {
    borderWidth: 2,
    borderColor: '#FF1B6D',
  },
  avatarOption: {
    width: '100%',
    height: '100%',
  },
  selectedAvatarCheck: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: '#000',
    borderRadius: 12,
  },
}); 