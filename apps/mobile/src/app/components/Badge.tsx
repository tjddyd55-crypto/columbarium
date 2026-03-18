import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color = theme.colors.primary }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
});
