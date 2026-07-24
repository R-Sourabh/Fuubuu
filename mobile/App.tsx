import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { LogBox } from 'react-native';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { AppNavigator } from './src/navigation/AppNavigator';

// Ignore non-critical warning logs generated inside Expo Go container
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported',
]);

// Configure global query settings.
// gcTime defines how long the offline cached entries persist on disk (24 hours).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes validity
      gcTime: 1000 * 60 * 60 * 24, // 24 hours persistent local lifetime
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

/**
 * Main application entrypoint.
 * Integrates disk-based Query persistence, notification listener subscriptions, and React Navigation.
 */
export default function App() {
  useEffect(() => {
    // Request permission & fetch token
    registerForPushNotificationsAsync();

    // Foreground listener
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Push notification received in foreground:', notification);
    });

    // Action/tap response listener
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Push notification clicked/responded:', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PersistQueryClientProvider>
  );
}
