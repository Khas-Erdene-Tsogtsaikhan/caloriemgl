import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

export default function ModalHandle() {
  return (
    <View style={styles.container}>
      <View style={styles.handle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
  },
});
