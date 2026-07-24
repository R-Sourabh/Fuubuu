import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { CompetitionsScreen } from '../screens/CompetitionsScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { TabParamList } from './types';
import { COLORS } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Configure bottom-tab views for the four main dashboards.
 */
export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          
          if (route.name === 'HomeTab') {
            iconName = 'home-outline';
          } else if (route.name === 'CompetitionsTab') {
            iconName = 'trophy-outline';
          } else if (route.name === 'MatchesTab') {
            iconName = 'calendar-outline';
          } else if (route.name === 'FavoritesTab') {
            iconName = 'star-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="CompetitionsTab" component={CompetitionsScreen} options={{ tabBarLabel: 'Leagues' }} />
      <Tab.Screen name="MatchesTab" component={MatchesScreen} options={{ tabBarLabel: 'Matches' }} />
      <Tab.Screen name="FavoritesTab" component={FavoritesScreen} options={{ tabBarLabel: 'Favorites' }} />
    </Tab.Navigator>
  );
}
