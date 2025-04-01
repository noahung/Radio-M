import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Language = 'en' | 'my';

interface Settings {
  isDarkMode: boolean;
  language: Language;
  notificationsEnabled: boolean;
  isInitialized: boolean;
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
  isInitialized: false,
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
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({
          ...parsedSettings,
          isInitialized: true,
        });
      } else {
        // Initialize with system color scheme if available
        setSettings({
          ...defaultSettings,
          isDarkMode: systemColorScheme === 'dark',
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set initialized even if there's an error to prevent infinite loading
      setSettings(prev => ({ ...prev, isInitialized: true }));
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

  // Don't render children until settings are initialized
  if (!settings.isInitialized) {
    return null;
  }

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

export default SettingsProvider; 