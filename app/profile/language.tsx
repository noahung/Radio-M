import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useFonts, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../i18n/translations';

interface LanguageOption {
  id: 'en' | 'my';
  label: string;
  nativeLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'my', label: 'Burmese', nativeLabel: 'မြန်မာ' },
];

export default function LanguageScreen() {
  const { language, theme, setLanguage } = useSettings();
  const t = translations[language];

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleLanguageSelect = async (langId: 'en' | 'my') => {
    await setLanguage(langId);
    router.back();
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, theme === 'light' && { backgroundColor: '#F5F5F7' }]}>
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={theme === 'dark' ? "#fff" : "#000"} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === 'light' && styles.lightText]}>
          {t.language}
        </Text>
      </View>
      
      <View style={[styles.languageContainer, theme === 'light' && styles.lightContainer]}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageOption,
              language === lang.id && styles.selectedLanguage,
              theme === 'light' && styles.lightLanguageOption,
              language === lang.id && theme === 'light' && styles.lightSelectedLanguage,
            ]}
            onPress={() => handleLanguageSelect(lang.id)}
          >
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageLabel, 
                theme === 'light' && styles.lightText
              ]}>
                {lang.label}
              </Text>
              <Text style={[
                styles.nativeLabel, 
                theme === 'light' && styles.lightSecondaryText
              ]}>
                {lang.nativeLabel}
              </Text>
            </View>
            
            {language === lang.id && (
              <Ionicons name="checkmark-circle" size={24} color="#8f47ff" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  languageContainer: {
    marginHorizontal: 24,
    backgroundColor: '#1F1F24',
    borderRadius: 16,
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  selectedLanguage: {
    backgroundColor: 'rgba(143, 71, 255, 0.1)',
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
  nativeLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  lightText: {
    color: '#000',
  },
  lightSecondaryText: {
    color: 'rgba(0,0,0,0.6)',
  },
  lightContainer: {
    backgroundColor: '#F0F0F5',
  },
  lightLanguageOption: {
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  lightSelectedLanguage: {
    backgroundColor: 'rgba(143, 71, 255, 0.1)',
  },
}); 