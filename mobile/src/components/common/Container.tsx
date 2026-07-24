import React from 'react';
import { View, StyleSheet, StatusBar, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import { OfflineBanner } from './OfflineBanner';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safe?: boolean;
}

/**
 * Common wrapper for screens, providing correct backgrounds, status bar configurations,
 * and device Safe Area padding. Incorporates the global offline status banner.
 */
export function Container({ children, style, safe = true }: ContainerProps) {
  const content = (
    <>
      <OfflineBanner />
      {children}
    </>
  );

  if (safe) {
    return (
      <SafeAreaView style={[styles.container, style]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        {content}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
