import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '@/src/theme/tokens';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🥗</Text>
      <Text style={styles.title}>Nutrio</Text>
      <Text style={styles.subtitle}>Your nutrition companion</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 72, marginBottom: spacing.lg },
  title: { ...typography.big, color: colors.primary, fontSize: 44 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  spinner: { marginTop: spacing.huge },
});
