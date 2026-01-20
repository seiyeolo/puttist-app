import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  variant = 'default',
  style,
  padding = 'md'
}: CardProps) {
  return (
    <View style={[
      styles.base,
      styles[variant],
      styles[`padding_${padding}`],
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  default: {
    backgroundColor: COLORS.surface,
  },
  elevated: {
    backgroundColor: COLORS.surfaceLight,
    ...SHADOWS.md,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradient: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: SPACING.md,
  },
  padding_md: {
    padding: SPACING.lg,
  },
  padding_lg: {
    padding: SPACING.xl,
  },
});
