import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export default function Card({ children, style, noPadding }: CardProps) {
  return (
    <View style={[styles.card, noPadding && styles.noPadding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    ...shadows.md,
  },
  noPadding: {
    padding: 0,
  },
});
