import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={theme.colors.gray[400]}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.md },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.black,
  },
  inputError: { borderColor: theme.colors.danger },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
});
