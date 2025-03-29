import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Language = 'en' | 'my';

interface Settings {
  isDarkMode: boolean;
  language: Language;
  notificationsEnabled: boolean;
}

interface SettingsContextType extends Settings {
  toggleDarkMode: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
}

const defaultSettings: Settings = {
  isDarkMode: true,
  language: 'en',
  notificationsEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('appSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        // Initialize with system color scheme if available
        setSettings({
          ...defaultSettings,
          isDarkMode: systemColorScheme === 'dark',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newSettings = {
      ...settings,
      isDarkMode: !settings.isDarkMode,
    };
    await saveSettings(newSettings);
  };

  const toggleNotifications = async () => {
    const newSettings = {
      ...settings,
      notificationsEnabled: !settings.notificationsEnabled,
    };
    await saveSettings(newSettings);
  };

  const setLanguage = async (lang: Language) => {
    const newSettings = {
      ...settings,
      language: lang,
    };
    await saveSettings(newSettings);
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        toggleDarkMode,
        toggleNotifications,
        setLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 