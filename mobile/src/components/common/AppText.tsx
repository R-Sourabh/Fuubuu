import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme/theme';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  size?: keyof typeof TYPOGRAPHY.sizes;
  weight?: keyof typeof TYPOGRAPHY.weights;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

/**
 * A customized Text component configured with default theme settings.
 */
export function AppText({
  children,
  style,
  size = 'md',
  weight = 'regular',
  color = COLORS.textPrimary,
  align = 'left',
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[
        {
          fontSize: TYPOGRAPHY.sizes[size],
          fontWeight: TYPOGRAPHY.weights[weight],
          color: color,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
