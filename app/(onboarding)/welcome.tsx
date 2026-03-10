import Button from '@/src/components/ui/Button';
import { colors, spacing, typography } from '@/src/theme/tokens';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🥗</Text>
        <Text style={styles.title}>Nutrio</Text>
        <Text style={styles.subtitle}>Таны эрүүл амьдралын шинэ эхлэл</Text>
      </View>
      <View style={styles.features}>
       
      </View>
      <View style={styles.footer}>
        <Button title="Эхлэх" onPress={() => router.push('/(onboarding)/step1')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xxl },
  hero: { alignItems: 'center', marginBottom: spacing.huge },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: { ...typography.big, color: colors.primary, fontSize: 42 },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  features: { gap: spacing.lg, marginBottom: spacing.huge },
  feature: { ...typography.body, color: colors.text, textAlign: 'center' },
  footer: { marginTop: 'auto' },
});
