import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Set up general notification handler behaviors (alerts, sounds, badges)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests device permissions and returns the Expo Push Token.
 * Sets up custom vibration channels on Android devices.
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B4332',
    });
  }

  // Request permissions regardless of device (required for local scheduling too)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to obtain push notification permissions.');
    return null;
  }

  // Remote token requires a physical device and configured EAS projectId
  if (Device.isDevice) {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log('EAS projectId is not configured in app.json. Remote push tokens are disabled, falling back to local triggers.');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Registered Expo Push Token:', token);
    } catch (e) {
      console.warn('Error fetching Expo Push Token:', e);
    }
  } else {
    console.log('Skipping remote push token registration (running on virtual simulator device).');
  }

  return token;
}

/**
 * Instantly triggers/schedules a local push notification popup.
 */
export async function scheduleLocalNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: null, // Fired immediately
  });
}
