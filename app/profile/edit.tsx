import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, FlatList, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface UserData {
  name: string;
  status: string;
  country: Country;
  avatar: string;
}

// Common countries for Myanmar diaspora
const COUNTRIES: Country[] = [
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
];

const AVATARS = [
  'avatar1.png',
  'avatar2.png',
  'avatar3.png',
  'avatar4.png',
  'avatar5.png',
  'avatar6.png',
  'avatar7.png',
  'avatar8.png',
  'avatar9.png',
  'avatar10.png',
];

const AVATAR_IMAGES: { [key: string]: any } = {
  'avatar1.png': require('../../assets/avatars/avatar1.png'),
  'avatar2.png': require('../../assets/avatars/avatar2.png'),
  'avatar3.png': require('../../assets/avatars/avatar3.png'),
  'avatar4.png': require('../../assets/avatars/avatar4.png'),
  'avatar5.png': require('../../assets/avatars/avatar5.png'),
  'avatar6.png': require('../../assets/avatars/avatar6.png'),
  'avatar7.png': require('../../assets/avatars/avatar7.png'),
  'avatar8.png': require('../../assets/avatars/avatar8.png'),
  'avatar9.png': require('../../assets/avatars/avatar9.png'),
  'avatar10.png': require('../../assets/avatars/avatar10.png'),
};

export default function EditProfileScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [name, setName] = useState('Andrew Ainsley');
  const [status, setStatus] = useState('Music lover and radio enthusiast 🎧');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[1]); // Default to US
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1.png');
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const data = JSON.parse(userDataString);
        if (data.name) setName(data.name);
        if (data.country) setSelectedCountry(data.country);
        if (data.status) setStatus(data.status);
        if (data.avatar) setSelectedAvatar(data.avatar);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const handleSave = async () => {
    try {
      const updatedUserData = {
        name,
        country: selectedCountry,
        status,
        avatar: selectedAvatar
      };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => {
        setSelectedCountry(item);
        setCountryModalVisible(false);
      }}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      {selectedCountry.code === item.code && (
        <Ionicons name="checkmark" size={20} color="#FF1B6D" style={styles.checkmark} />
      )}
    </TouchableOpacity>
  );

  const renderAvatarItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.avatarItem}
      onPress={() => {
        setSelectedAvatar(item);
        setAvatarModalVisible(false);
      }}
    >
      <Image
        source={AVATAR_IMAGES[item]}
        style={[
          styles.avatarPreview,
          selectedAvatar === item && styles.selectedAvatar
        ]}
      />
      {selectedAvatar === item && (
        <View style={styles.avatarCheckmark}>
          <Ionicons name="checkmark" size={20} color="#fff" />
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => setAvatarModalVisible(true)}
            >
              <Image
                source={AVATAR_IMAGES[selectedAvatar]}
                style={styles.currentAvatar}
              />
              <View style={styles.avatarEditOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>Tap to change avatar</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={status}
              onChangeText={setStatus}
              placeholder="Enter your status"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Country/Region</Text>
            <TouchableOpacity
              style={styles.countrySelector}
              onPress={() => setCountryModalVisible(true)}
            >
              <View style={styles.selectedCountry}>
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryName}>{selectedCountry.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
            <Text style={styles.updateButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={countryModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCountryModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country</Text>
                <TouchableOpacity
                  onPress={() => setCountryModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={COUNTRIES}
                renderItem={renderCountryItem}
                keyExtractor={item => item.code}
                style={styles.countryList}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={avatarModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setAvatarModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Avatar</Text>
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
                keyExtractor={item => item}
                numColumns={3}
                style={styles.avatarList}
                contentContainerStyle={styles.avatarListContent}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#fff',
  },
  saveButton: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FF1B6D',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  currentAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#fff',
  },
  updateButton: {
    backgroundColor: '#FF1B6D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  updateButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
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
  countryList: {
    padding: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  avatarList: {
    padding: 12,
  },
  avatarListContent: {
    paddingBottom: 24,
  },
  avatarItem: {
    flex: 1,
    aspectRatio: 1,
    padding: 8,
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  selectedAvatar: {
    borderWidth: 2,
    borderColor: '#FF1B6D',
  },
  avatarCheckmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF1B6D',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 