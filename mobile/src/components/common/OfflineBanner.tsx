import React, { useEffect, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { AppText } from './AppText';
import { COLORS, SPACING } from '../../theme/theme';

/**
 * Global offline alert banner that slides into view when connectivity is lost.
 */
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Treat state.isConnected null/undefined as connected by default to avoid flash warnings
      const offline = state.isConnected === false;
      setIsOffline(offline);

      Animated.spring(translateY, {
        toValue: offline ? 0 : -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    });

    return () => unsubscribe();
  }, []);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <AppText size="xs" color="#FFFFFF" weight="bold" align="center">
        ⚠️ Offline Mode — Displaying Cached Football Data
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E63946', // Distinct red for network alerts
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#B22222',
  },
});
