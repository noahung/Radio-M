import { View, Text, StyleSheet, TouchableOpacity, Linking, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { translations } from '../i18n/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

type Language = 'en' | 'my';

export default function DonateScreen() {
  const { theme, language, setLanguage } = useSettings();
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const t = translations[language];

  if (!fontsLoaded) {
    return null;
  }

  const handleRequestStations = () => {
    Linking.openURL('mailto:your-email@example.com?subject=Station Request');
  };

  const handleReportIssue = () => {
    Linking.openURL('mailto:your-email@example.com?subject=Issue Report');
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('language', newLanguage);
      setLanguage(newLanguage);
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
  };

  return (
    <View style={[styles.container, theme === 'light' && { backgroundColor: '#F5F5F7' }]}>
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, theme === 'light' && styles.lightText]}>
          Support
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, theme === 'light' && styles.lightCard]}>
          <Text style={[styles.cardTitle, theme === 'light' && styles.lightText]}>
            Support the Developer
          </Text>
          <Text style={[styles.cardDescription, theme === 'light' && styles.lightSecondaryText]}>
            If you enjoy using Radio M, consider supporting its development. Your contribution helps maintain and improve the app.
          </Text>
          <TouchableOpacity 
            style={styles.donateButton}
            onPress={() => Linking.openURL('https://paypal.me/noahaung')}
          >
            <Ionicons name="heart" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Donate Now</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, theme === 'light' && styles.lightActionButton]}
          onPress={() => setShowLanguageModal(true)}
        >
          <Ionicons 
            name="language-outline" 
            size={24} 
            color={theme === 'dark' ? "#fff" : "#000"} 
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, theme === 'light' && styles.lightText]}>
            Language / ဘာသာစကား
          </Text>
          <View style={styles.languageInfo}>
            <Text style={[styles.languageText, theme === 'light' && styles.lightSecondaryText]}>
              {language === 'en' ? 'English' : 'မြန်မာ'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, theme === 'light' && styles.lightActionButton]}
          onPress={handleRequestStations}
        >
          <Ionicons 
            name="radio-outline" 
            size={24} 
            color={theme === 'dark' ? "#fff" : "#000"} 
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, theme === 'light' && styles.lightText]}>
            Request Stations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, theme === 'light' && styles.lightActionButton]}
          onPress={handleReportIssue}
        >
          <Ionicons 
            name="bug-outline" 
            size={24} 
            color={theme === 'dark' ? "#fff" : "#000"} 
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, theme === 'light' && styles.lightText]}>
            Report an Issue
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, theme === 'light' && styles.lightModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, theme === 'light' && styles.lightText]}>
                Select Language / ဘာသာစကားရွေးချယ်ပါ
              </Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme === 'dark' ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.selectedLanguage]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[styles.languageOptionText, theme === 'light' && styles.lightText]}>
                English
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark" size={24} color="#FF1B6D" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, language === 'my' && styles.selectedLanguage]}
              onPress={() => handleLanguageChange('my')}
            >
              <Text style={[styles.languageOptionText, theme === 'light' && styles.lightText]}>
                မြန်မာ
              </Text>
              {language === 'my' && (
                <Ionicons name="checkmark" size={24} color="#FF1B6D" />
              )}
            </TouchableOpacity>
          </View>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#fff',
  },
  content: {
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#1F1F24',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  lightCard: {
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
  },
  cardDescription: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
    lineHeight: 24,
  },
  donateButton: {
    backgroundColor: '#FF1B6D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  lightActionButton: {
    backgroundColor: '#fff',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
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
  lightText: {
    color: '#000',
  },
  lightSecondaryText: {
    color: 'rgba(0,0,0,0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F1F24',
    borderRadius: 16,
    width: '85%',
    maxWidth: 340,
  },
  lightModalContent: {
    backgroundColor: '#fff',
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
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(255,27,109,0.1)',
  },
  languageOptionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
}); 