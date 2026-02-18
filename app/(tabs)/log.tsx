import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import ModalHandle from '@/src/components/ui/ModalHandle';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { useNutrioStore } from '@/src/store';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import { calculateBMI, getBMICategory } from '@/src/utils/calories';
import { formatDate } from '@/src/utils/date';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WeightScreen() {
  const insets = useSafeAreaInsets();
  const profile = useNutrioStore((s) => s.profile);
  const weightEntries = useNutrioStore((s) => s.weightEntries);
  const addWeightEntry = useNutrioStore((s) => s.addWeightEntry);
  const updateWeightEntry = useNutrioStore((s) => s.updateWeightEntry);
  const removeWeightEntry = useNutrioStore((s) => s.removeWeightEntry);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  // Edit modal state
  const [editId, setEditId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');

  const currentWeight = profile?.currentWeightKg ?? 0;
  const startingWeight = profile?.currentWeightKg ?? 0; // first onboarding weight
  const goalWeight = profile?.targetWeightKg ?? 0;
  const heightCm = profile?.heightCm ?? 170;

  // Compute starting weight from first entry or profile
  const firstEntry = weightEntries.length > 0 ? weightEntries[0] : null;
  const startW = firstEntry ? firstEntry.weightKg : startingWeight;

  // Change from previous entry
  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const latestEntry = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const prevEntry = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const changeFromPrev = latestEntry && prevEntry
    ? Math.round((latestEntry.weightKg - prevEntry.weightKg) * 10) / 10
    : 0;

  // Progress toward goal (0 to 1)
  const totalToLose = startW - goalWeight;
  const lost = startW - currentWeight;
  const progressRatio = totalToLose !== 0 ? Math.min(Math.max(lost / totalToLose, 0), 1) : 0;

  const bmi = calculateBMI(currentWeight, heightCm);
  const bmiCategory = getBMICategory(bmi);

  // Get change indicator for each entry
  const getChange = (idx: number): number => {
    if (idx === 0) return 0;
    return Math.round((sorted[idx].weightKg - sorted[idx - 1].weightKg) * 10) / 10;
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Weight Tracker</Text>

      {/* Current Weight Card */}
      <Card style={styles.currentCard}>
        <Text style={styles.currentLabel}>Current</Text>
        <View style={styles.currentRow}>
          <Text style={styles.currentWeight}>{currentWeight}</Text>
          <Text style={styles.currentUnit}>kg</Text>
          {changeFromPrev !== 0 && (
            <View style={[styles.changeBadge, changeFromPrev < 0 ? styles.changeBadgeGreen : styles.changeBadgeRed]}>
              <Text style={[styles.changeText, changeFromPrev < 0 ? styles.changeTextGreen : styles.changeTextRed]}>
                {changeFromPrev > 0 ? '+' : ''}{changeFromPrev} kg
              </Text>
            </View>
          )}
        </View>

        <ProgressBar
          progress={progressRatio}
          color={colors.secondary}
          height={10}
          style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}
        />
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Starting: {startW} kg</Text>
          <Text style={styles.progressLabel}>Goal: {goalWeight} kg</Text>
        </View>

        <Button
          title="Update"
          onPress={() => {
            setWeightInput(String(currentWeight));
            setShowUpdateModal(true);
          }}
          style={styles.updateBtn}
        />
      </Card>

      {/* BMI Quick View */}
      <Card style={styles.bmiCard}>
        <View style={styles.bmiRow}>
          <View>
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={styles.bmiValue}>{bmi}</Text>
          </View>
          <View style={[styles.bmiCategoryBadge, { backgroundColor: getBmiColor(bmi) + '20' }]}>
            <Text style={[styles.bmiCategoryText, { color: getBmiColor(bmi) }]}>{bmiCategory}</Text>
          </View>
        </View>
      </Card>

      {/* History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>History</Text>
        <TouchableOpacity onPress={() => router.push('/weight-history')}>
          <Text style={styles.viewAllBtn}>View all</Text>
        </TouchableOpacity>
      </View>

      {sorted.length === 0 ? (
        <Text style={styles.emptyText}>No weight entries yet — tap Update to start tracking</Text>
      ) : (
        [...sorted].reverse().slice(0, 7).map((entry, revIdx) => {
          const realIdx = sorted.length - 1 - revIdx;
          const change = getChange(realIdx);
          return (
            <Card key={entry.id} style={styles.historyItem}>
              <View style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyWeight}>{entry.weightKg} kg</Text>
                  <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                </View>
                {change !== 0 && (
                  <View style={[styles.changeBadgeSm, change < 0 ? styles.changeBadgeGreen : styles.changeBadgeRed]}>
                    <Text style={[styles.changeTextSm, change < 0 ? styles.changeTextGreen : styles.changeTextRed]}>
                      {change > 0 ? '+' : ''}{change} kg
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => {
                    Alert.alert(
                      `${entry.weightKg} kg`,
                      `${formatDate(entry.date)}`,
                      [
                        {
                          text: 'Edit',
                          onPress: () => {
                            setEditId(entry.id);
                            setEditWeight(String(entry.weightKg));
                          },
                        },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => removeWeightEntry(entry.id),
                        },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Text style={styles.moreBtnText}>⋮</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })
      )}

      <View style={{ height: 30 }} />

      {/* Update Weight Modal */}
      <Modal visible={showUpdateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ModalHandle />
            <Text style={styles.modalTitle}>Update Weight</Text>
            <Input
              label="New weight"
              value={weightInput}
              onChangeText={setWeightInput}
              placeholder={String(currentWeight)}
              keyboardType="numeric"
              suffix="kg"
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setShowUpdateModal(false)} style={{ flex: 1 }} />
              <Button
                title="Save"
                onPress={() => {
                  const w = parseFloat(weightInput);
                  if (w > 0) {
                    addWeightEntry(w);
                    setShowUpdateModal(false);
                    setWeightInput('');
                  }
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Weight Modal */}
      <Modal visible={!!editId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ModalHandle />
            <Text style={styles.modalTitle}>Edit Weight</Text>
            <Input
              label="Weight"
              value={editWeight}
              onChangeText={setEditWeight}
              keyboardType="numeric"
              suffix="kg"
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setEditId(null)} style={{ flex: 1 }} />
              <Button
                title="Save"
                onPress={() => {
                  const w = parseFloat(editWeight);
                  if (w > 0 && editId) {
                    updateWeightEntry(editId, w);
                    setEditId(null);
                    setEditWeight('');
                  }
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function getBmiColor(bmi: number): string {
  if (bmi < 18.5) return '#42A5F5';
  if (bmi < 25) return colors.primary;
  if (bmi < 30) return colors.warning;
  return colors.error;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  screenTitle: { ...typography.h1, color: colors.text, textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  currentCard: { marginBottom: spacing.lg },
  currentLabel: { ...typography.captionBold, color: colors.textSecondary },
  currentRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginTop: spacing.xs },
  currentWeight: { ...typography.big, color: colors.text, fontSize: 42 },
  currentUnit: { ...typography.h3, color: colors.textSecondary },
  changeBadge: { paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radii.full, marginLeft: spacing.sm },
  changeBadgeGreen: { backgroundColor: colors.success + '18' },
  changeBadgeRed: { backgroundColor: colors.error + '18' },
  changeText: { ...typography.captionBold },
  changeTextGreen: { color: colors.success },
  changeTextRed: { color: colors.error },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { ...typography.caption, color: colors.textTertiary },
  updateBtn: { marginTop: spacing.lg, backgroundColor: colors.secondary },
  bmiCard: { marginBottom: spacing.xl },
  bmiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bmiLabel: { ...typography.captionBold, color: colors.textSecondary },
  bmiValue: { ...typography.h1, color: colors.text },
  bmiCategoryBadge: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radii.full },
  bmiCategoryText: { ...typography.captionBold },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  historyTitle: { ...typography.h3, color: colors.text },
  viewAllBtn: { ...typography.captionBold, color: colors.primary },
  emptyText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.xxl },
  historyItem: { marginBottom: spacing.sm },
  historyRow: { flexDirection: 'row', alignItems: 'center' },
  historyWeight: { ...typography.bodyBold, color: colors.text, fontSize: 18 },
  historyDate: { ...typography.caption, color: colors.textTertiary, marginTop: 2 },
  changeBadgeSm: { paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radii.full },
  changeTextSm: { ...typography.small, fontWeight: '600' },
  moreBtn: { padding: spacing.sm, marginLeft: spacing.sm },
  moreBtnText: { fontSize: 20, color: colors.textTertiary, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalTitle: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.xl },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
});
