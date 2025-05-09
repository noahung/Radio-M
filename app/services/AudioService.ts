import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure notifications for media controls
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const configureAudioSession = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: 1, // DoNotMix
      interruptionModeAndroid: 1, // DoNotMix
    });
    
    // Configure notifications for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('playback-controls', {
        name: 'Playback Controls',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 0, 0, 0],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: null,
        enableLights: false,
        enableVibrate: false,
        showBadge: false,
      });
    }

    return true;
  } catch (error) {
    console.error('Error configuring audio session:', error);
    return false;
  }
};

export const showPlaybackNotification = async (
  stationName: string,
  description: string,
  isPlaying: boolean,
  imageUrl?: string
) => {
  if (Platform.OS === 'web') return;

  try {
    // Create or update notification with media controls
    await Notifications.scheduleNotificationAsync({
      content: {
        title: stationName,
        body: description,
        data: { isPlaying },
        sound: false,
        priority: 'high',
        sticky: true,
        autoDismiss: false,
        ...(Platform.OS === 'android' && {
          channelId: 'playback-controls',
          color: '#8B3DFF',
          // Add action buttons for playback control
          actions: [
            {
              identifier: isPlaying ? 'pause' : 'play',
              buttonTitle: isPlaying ? 'Pause' : 'Play',
              options: {
                isDestructive: false,
                isAuthenticationRequired: false,
              },
            },
            {
              identifier: 'stop',
              buttonTitle: 'Stop',
              options: {
                isDestructive: true,
                isAuthenticationRequired: false,
              },
            },
          ],
          // Add media style for Android
          style: {
            type: 'media',
            mediaStyle: {
              showPlayPauseButton: true,
              showStopButton: true,
              showNextButton: false,
              showPreviousButton: false,
            },
          },
          // Expo Notifications does not support custom images in notification yet
          // If/when supported, add imageUrl here
          // largeIcon: imageUrl, // <-- Not supported in Expo as of 2024
        }),
      },
      trigger: null,
      identifier: 'playback-notification',
    });
  } catch (error) {
    console.error('Error showing playback notification:', error);
  }
};

export const dismissPlaybackNotification = async () => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.dismissNotificationAsync('playback-notification');
  } catch (error) {
    console.error('Error dismissing playback notification:', error);
  }
};

// Setup notification response handler for the playback controls
export const setupNotificationHandlers = (
  onPlay: () => void,
  onPause: () => void,
  onStop: () => void
) => {
  if (Platform.OS === 'web') return null;

  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const actionId = response.actionIdentifier;
    
    if (actionId === 'play') {
      onPlay();
    } else if (actionId === 'pause') {
      onPause();
    } else if (actionId === 'stop') {
      onStop();
    }
  });

  return subscription;
}; 