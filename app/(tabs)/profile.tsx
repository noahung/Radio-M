import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../i18n/translations';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const settings = useSettings();
  const t = translations[settings.language];
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleLanguageChange = () => {
    Alert.alert(
      t.language,
      '',
      [
        {
          text: t.english,
          onPress: () => settings.setLanguage('en'),
        },
        {
          text: t.burmese,
          onPress: () => settings.setLanguage('my'),
        },
        {
          text: t.cancel,
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      t.logoutConfirmation || 'Are you sure you want to log out?',
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.logout,
          style: 'destructive',
          onPress: () => {
            // Navigate to the initial screen with welcome_screen.png background
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: settings.isDarkMode ? '#000' : '#fff' }
    ]}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(25,25,112,0.8)']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{t.settings}</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View>
            <View style={styles.section}>
              <Text style={[
                styles.sectionTitle,
                { color: settings.isDarkMode ? '#fff' : '#000' }
              ]}>
                {t.appearance}
              </Text>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={settings.toggleDarkMode}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="moon-outline"
                    size={24}
                    color={settings.isDarkMode ? '#fff' : '#000'}
                  />
                  <Text style={[
                    styles.settingText,
                    { color: settings.isDarkMode ? '#fff' : '#000' }
                  ]}>
                    {t.darkMode}
                  </Text>
                </View>
                <Switch
                  value={settings.isDarkMode}
                  onValueChange={settings.toggleDarkMode}
                  trackColor={{ false: '#767577', true: '#FF1B6D' }}
                  thumbColor={settings.isDarkMode ? '#fff' : '#f4f3f4'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={settings.toggleNotifications}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={settings.isDarkMode ? '#fff' : '#000'}
                  />
                  <Text style={[
                    styles.settingText,
                    { color: settings.isDarkMode ? '#fff' : '#000' }
                  ]}>
                    {t.notifications}
                  </Text>
                </View>
                <Switch
                  value={settings.notificationsEnabled}
                  onValueChange={settings.toggleNotifications}
                  trackColor={{ false: '#767577', true: '#FF1B6D' }}
                  thumbColor={settings.notificationsEnabled ? '#fff' : '#f4f3f4'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleLanguageChange}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="language-outline"
                    size={24}
                    color={settings.isDarkMode ? '#fff' : '#000'}
                  />
                  <Text style={[
                    styles.settingText,
                    { color: settings.isDarkMode ? '#fff' : '#000' }
                  ]}>
                    {t.language}
                  </Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={[
                    styles.settingValue,
                    { color: settings.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }
                  ]}>
                    {settings.language === 'en' ? t.english : t.burmese}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={settings.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[
                styles.sectionTitle,
                { color: settings.isDarkMode ? '#fff' : '#000' }
              ]}>
                {t.about}
              </Text>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={settings.isDarkMode ? '#fff' : '#000'}
                  />
                  <Text style={[
                    styles.settingText,
                    { color: settings.isDarkMode ? '#fff' : '#000' }
                  ]}>
                    {t.privacyPolicy}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={settings.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={settings.isDarkMode ? '#fff' : '#000'}
                  />
                  <Text style={[
                    styles.settingText,
                    { color: settings.isDarkMode ? '#fff' : '#000' }
                  ]}>
                    {t.termsOfService}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={settings.isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color={settings.isDarkMode ? '#fff' : '#000'}
                  />
                  <Text style={[
                    styles.settingText,
                    { color: settings.isDarkMode ? '#fff' : '#000' }
                  ]}>
                    Version 1.0.0
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>{t.logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 100,
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    marginRight: 8,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,27,109,0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#FF1B6D',
  },
}); 