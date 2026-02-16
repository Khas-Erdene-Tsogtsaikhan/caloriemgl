import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNutrioStore } from '@/src/store';
import { colors, spacing, typography, radii, shadows } from '@/src/theme/tokens';
import { formatDate } from '@/src/utils/date';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';

export default function WeightHistoryScreen() {
  const insets = useSafeAreaInsets();
  const weightEntries = useNutrioStore((s) => s.weightEntries);
  const removeWeightEntry = useNutrioStore((s) => s.removeWeightEntry);

  const sorted = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));

  const getChange = (idx: number): number => {
    if (idx >= sorted.length - 1) return 0;
    return Math.round((sorted[idx].weightKg - sorted[idx + 1].weightKg) * 10) / 10;
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 50 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>All Weight Entries</Text>
        <Text style={styles.subtitle}>{sorted.length} entries</Text>
      </View>

      {sorted.length === 0 ? (
        <Text style={styles.emptyText}>No weight entries yet.</Text>
      ) : (
        sorted.map((entry, idx) => {
          const change = getChange(idx);
          return (
            <Card key={entry.id} style={styles.entryCard}>
              <View style={styles.entryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryWeight}>{entry.weightKg} kg</Text>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  <Text style={styles.entryBmi}>BMI {entry.bmi}</Text>
                </View>
                {change !== 0 && (
                  <View style={[styles.changeBadge, change < 0 ? styles.changeGreen : styles.changeRed]}>
                    <Text style={[styles.changeText, change < 0 ? styles.changeTextGreen : styles.changeTextRed]}>
                      {change > 0 ? '+' : ''}{change} kg
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    Alert.alert(
                      'Delete Entry',
                      `Remove ${entry.weightKg} kg on ${formatDate(entry.date)}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => removeWeightEntry(entry.id),
                        },
                      ]
                    )
                  }
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  header: { marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  emptyText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xxl },
  entryCard: { marginBottom: spacing.sm },
  entryRow: { flexDirection: 'row', alignItems: 'center' },
  entryWeight: { ...typography.bodyBold, color: colors.text, fontSize: 18 },
  entryDate: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  entryBmi: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  changeBadge: { paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radii.full, marginRight: spacing.sm },
  changeGreen: { backgroundColor: colors.success + '18' },
  changeRed: { backgroundColor: colors.error + '18' },
  changeText: { ...typography.captionBold },
  changeTextGreen: { color: colors.success },
  changeTextRed: { color: colors.error },
  deleteBtn: { padding: spacing.sm },
  deleteBtnText: { fontSize: 16, color: colors.error },
});
