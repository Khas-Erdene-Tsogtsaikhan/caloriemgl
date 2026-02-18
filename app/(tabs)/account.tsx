import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import ModalHandle from '@/src/components/ui/ModalHandle';
import { ACTIVITY_LABELS, GOAL_LABELS } from '@/src/data/presets';
import { useNutrioStore } from '@/src/store';
import { colors, radii, spacing, typography } from '@/src/theme/tokens';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const profile = useNutrioStore((s) => s.profile);
  const updateProfile = useNutrioStore((s) => s.updateProfile);
  const resetOnboarding = useNutrioStore((s) => s.resetOnboarding);
  const clearAllData = useNutrioStore((s) => s.clearAllData);

  const [editModal, setEditModal] = useState(false);
  const [editName, setEditName] = useState(profile?.name ?? '');
  const [editHeight, setEditHeight] = useState(String(profile?.heightCm ?? 170));
  const [editWeight, setEditWeight] = useState(String(profile?.currentWeightKg ?? 70));
  const [editTarget, setEditTarget] = useState(String(profile?.targetWeightKg ?? 65));

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Account</Text>

      {/* Profile Summary */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile?.name ?? 'User'}</Text>
            <Text style={styles.profileMeta}>
              {GOAL_LABELS[profile?.goal ?? 'maintain_weight']} · {ACTIVITY_LABELS[profile?.activityLevel ?? 'moderately_active']}
            </Text>
          </View>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{profile?.dailyCalorieGoal ?? 2000}</Text>
            <Text style={styles.profileStatLabel}>Daily Goal</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{profile?.currentWeightKg ?? 0} kg</Text>
            <Text style={styles.profileStatLabel}>Current</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>{profile?.targetWeightKg ?? 0} kg</Text>
            <Text style={styles.profileStatLabel}>Target</Text>
          </View>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Edit Profile"
          variant="secondary"
          onPress={() => {
            setEditName(profile?.name ?? '');
            setEditHeight(String(profile?.heightCm ?? 170));
            setEditWeight(String(profile?.currentWeightKg ?? 70));
            setEditTarget(String(profile?.targetWeightKg ?? 65));
            setEditModal(true);
          }}
        />
        <Button
          title="Reset Onboarding"
          variant="ghost"
          onPress={() =>
            Alert.alert('Reset Onboarding', 'You will go through onboarding again.', [
              { text: 'Cancel' },
              {
                text: 'Reset',
                onPress: () => {
                  resetOnboarding();
                  router.replace('/(onboarding)/welcome');
                },
              },
            ])
          }
        />
        <Button
          title="Clear All Data"
          variant="danger"
          onPress={() =>
            Alert.alert('Clear All Data', 'This will delete all your data. Are you sure?', [
              { text: 'Cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  clearAllData();
                  router.replace('/(onboarding)/welcome');
                },
              },
            ])
          }
        />
      </View>

      <View style={{ height: 30 }} />

      {/* Edit Profile Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ModalHandle />
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Input label="Name" value={editName} onChangeText={setEditName} />
            <Input label="Height" value={editHeight} onChangeText={setEditHeight} keyboardType="numeric" suffix="cm" />
            <Input label="Current Weight" value={editWeight} onChangeText={setEditWeight} keyboardType="numeric" suffix="kg" />
            <Input label="Target Weight" value={editTarget} onChangeText={setEditTarget} keyboardType="numeric" suffix="kg" />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setEditModal(false)} style={{ flex: 1 }} />
              <Button
                title="Save"
                onPress={() => {
                  updateProfile({
                    name: editName.trim() || profile?.name,
                    heightCm: parseInt(editHeight, 10) || profile?.heightCm,
                    currentWeightKg: parseFloat(editWeight) || profile?.currentWeightKg,
                    targetWeightKg: parseFloat(editTarget) || profile?.targetWeightKg,
                  });
                  setEditModal(false);
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  screenTitle: { ...typography.h1, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.xl },
  profileCard: { marginBottom: spacing.lg },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight + '30', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h2, color: colors.primary },
  profileName: { ...typography.h3, color: colors.text },
  profileMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  profileStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: spacing.md },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatValue: { ...typography.bodyBold, color: colors.text },
  profileStatLabel: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  profileStatDivider: { width: 1, height: 30, backgroundColor: colors.border },
  actions: { gap: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xxl, paddingBottom: spacing.huge },
  modalTitle: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.xl },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
});
