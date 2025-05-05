import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

export default function InitialScreen() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/images/welcome_screen.png')}
        style={styles.background}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.logo}>Radio M</Text>
            <Text style={styles.title}>Away from home?</Text>
            <Text style={styles.subtitle}>
              Listen to the sound of home, radio stations from Myanmar
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
    paddingBottom: 48,
  },
  logo: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#fff',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 48,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FF1B6D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#fff',
  },
}); 