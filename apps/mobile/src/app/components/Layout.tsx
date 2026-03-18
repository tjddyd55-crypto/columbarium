import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';

interface LayoutProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  safe?: boolean;
}

export function Layout({ children, scroll = false, padded = true, safe = true }: LayoutProps) {
  const content = (
    <View style={[styles.inner, padded && styles.padded]}>
      {children}
    </View>
  );
  const Wrapper = scroll ? ScrollView : View;
  const body = scroll ? (
    <Wrapper style={styles.flex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {content}
    </Wrapper>
  ) : (
    <Wrapper style={styles.flex}>{content}</Wrapper>
  );
  if (safe) return <SafeAreaView style={styles.flex} edges={['top']}>{body}</SafeAreaView>;
  return body;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  inner: { flex: 1 },
  padded: { padding: theme.spacing.md },
  scrollContent: { flexGrow: 1 },
});
