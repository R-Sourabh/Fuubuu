import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Configure API Gateway endpoints.
 * Automatically resolves localhost hostnames to local network IPs
 * so that physical devices connected to Expo Go can communicate with the backend.
 */
const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  
  return Platform.select({
    ios: 'http://localhost:5000/api',
    android: 'http://10.0.2.2:5000/api',
    default: 'http://localhost:5000/api',
  });
};

export const API_BASE_URL = getBaseUrl();
console.log('[API URL] Resolved Base URL to:', API_BASE_URL);
