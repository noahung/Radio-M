import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Language = 'en' | 'my';
type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  language: Language;
  isInitialized: boolean;
}

interface SettingsContextType extends SettingsState {
  setTheme: (theme: Theme) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
}

const defaultSettings: SettingsState = {
  theme: 'dark',
  language: 'en',
  isInitialized: false,
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('appSettings');
      const storedTheme = await AsyncStorage.getItem('theme');
      const storedLanguage = await AsyncStorage.getItem('language');
      
      // Initialize with stored or system values
      const theme = storedTheme as Theme || 
                    (storedSettings ? JSON.parse(storedSettings).theme : null) || 
                    (systemColorScheme as Theme) || 
                    'dark';
                    
      const language = storedLanguage as Language || 
                      (storedSettings ? JSON.parse(storedSettings).language : null) || 
                      'en';
      
      setSettings({
        theme,
        language,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set initialized even if there's an error to prevent infinite loading
      setSettings(prev => ({ ...prev, isInitialized: true }));
    }
  };

  const setTheme = async (theme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', theme);
      setSettings(prev => ({ ...prev, theme }));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem('language', language);
      setSettings(prev => ({ ...prev, language }));
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Don't render children until settings are initialized
  if (!settings.isInitialized) {
    return null;
  }

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setTheme,
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