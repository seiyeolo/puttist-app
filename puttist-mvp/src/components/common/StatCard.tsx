import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatCard({
  label,
  value,
  icon,
  iconColor = COLORS.primary,
  trend,
  trendValue,
  size = 'md',
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return COLORS.success;
      case 'down': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <View style={[styles.container, styles[`size_${size}`]]}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={size === 'lg' ? 28 : 22} color={iconColor} />
        </View>
      )}
      <Text style={[styles.value, styles[`value_${size}`]]}>{value}</Text>
      <Text style={[styles.label, styles[`label_${size}`]]}>{label}</Text>
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Ionicons name={getTrendIcon()} size={14} color={getTrendColor()} />
          <Text style={[styles.trendValue, { color: getTrendColor() }]}>
            {trendValue}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  size_sm: {
    padding: SPACING.md,
    minWidth: 80,
  },
  size_md: {
    padding: SPACING.lg,
    minWidth: 100,
  },
  size_lg: {
    padding: SPACING.xl,
    minWidth: 120,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.bold,
  },
  value_sm: {
    fontSize: TYPOGRAPHY.h3,
  },
  value_md: {
    fontSize: TYPOGRAPHY.h2,
  },
  value_lg: {
    fontSize: TYPOGRAPHY.h1,
  },
  label: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  label_sm: {
    fontSize: TYPOGRAPHY.caption,
  },
  label_md: {
    fontSize: TYPOGRAPHY.bodySmall,
  },
  label_lg: {
    fontSize: TYPOGRAPHY.body,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  trendValue: {
    fontSize: TYPOGRAPHY.caption,
    marginLeft: 2,
    fontWeight: TYPOGRAPHY.medium,
  },
});
