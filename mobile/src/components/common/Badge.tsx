import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../theme/theme';
import { AppText } from './AppText';

interface BadgeProps {
  label: string;
  type?: 'live' | 'upcoming' | 'finished' | 'neutral';
  style?: ViewStyle;
}

/**
 * Status tag component used for match timing statuses or general indicators.
 */
export function Badge({ label, type = 'neutral', style }: BadgeProps) {
  let backgroundColor = '#F3F4F6';
  let textColor = COLORS.textSecondary;

  switch (type) {
    case 'live':
      backgroundColor = '#FDE8E8'; // Light red
      textColor = COLORS.live;      // Crimson
      break;
    case 'upcoming':
      backgroundColor = '#EBF5FF'; // Light blue
      textColor = COLORS.upcoming;  // Indigo
      break;
    case 'finished':
      backgroundColor = '#F3F4F6'; // Muted grey
      textColor = COLORS.finished;  // Grey
      break;
    case 'neutral':
      backgroundColor = '#EBF6F0'; // Light forest green
      textColor = COLORS.primary;   // Forest green
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <AppText size="xs" weight="bold" color={textColor} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
