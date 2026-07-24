import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../theme/theme';
import { AppText } from './AppText';

interface LoaderProps {
  message?: string;
}

/**
 * Centered spinner component used for full-screen loading states.
 */
export function Loader({ message }: LoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message ? (
        <AppText size="sm" color={COLORS.textSecondary} style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  message: {
    marginTop: SPACING.sm,
  },
});
