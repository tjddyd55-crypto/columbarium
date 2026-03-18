import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

export function Loading() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
});
