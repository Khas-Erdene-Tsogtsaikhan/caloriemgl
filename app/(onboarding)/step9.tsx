import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '@/src/theme/tokens';

export default function Step9() {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.4, { duration: 600 })),
      -1,
      true
    );
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/step10');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>Personalizing your experience…</Text>
        <Animated.View style={[styles.shimmerRow, shimmerStyle]}>
          <View style={styles.shimmerBar} />
          <View style={[styles.shimmerBar, { width: '70%' }]} />
          <View style={[styles.shimmerBar, { width: '50%' }]} />
        </Animated.View>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl },
  emoji: { fontSize: 56, marginBottom: spacing.xl },
  title: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.xxxl },
  shimmerRow: { width: '100%', gap: spacing.md, alignItems: 'center', marginBottom: spacing.xxxl },
  shimmerBar: { width: '90%', height: 12, borderRadius: 6, backgroundColor: colors.primaryLight },
  spinner: { marginTop: spacing.lg },
});
