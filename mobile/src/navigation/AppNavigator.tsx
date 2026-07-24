import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { CompetitionDetailScreen } from '../screens/CompetitionDetailScreen';
import { TeamDetailScreen } from '../screens/TeamDetailScreen';
import { MatchDetailScreen } from '../screens/MatchDetailScreen';
import { Loader } from '../components/common/Loader';
import { Container } from '../components/common/Container';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Stack Navigator.
 * Automatically switches routing layout flows between unauthenticated Login screens
 * and authenticated Main Tab Navigation based on user session status.
 */
export function AppNavigator() {
  const { user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <Container>
        <Loader message="Verifying security credentials..." />
      </Container>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="CompetitionDetail" component={CompetitionDetailScreen} />
          <Stack.Screen name="TeamDetail" component={TeamDetailScreen} />
          <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
