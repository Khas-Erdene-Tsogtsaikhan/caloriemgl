import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import { colors, spacing, typography } from '@/src/theme/tokens';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🥗</Text>
        <Text style={styles.title}>Nutrio</Text>
        <Text style={styles.subtitle}>Your personal nutrition companion{'\n'}made for Mongolia</Text>
      </View>
      <View style={styles.features}>
        {['🍜 Track Mongolian meals easily', '💧 Water & weight tracking', '📊 Weekly & monthly insights'].map((f) => (
          <Text key={f} style={styles.feature}>{f}</Text>
        ))}
      </View>
      <View style={styles.footer}>
        <Button title="Get Started" onPress={() => router.push('/(onboarding)/step1')} />
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
