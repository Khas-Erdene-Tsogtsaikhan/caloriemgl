import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, radii, shadows } from '../../theme/tokens';
import { addDays, formatDateWithDay, getTodayString, toDateString } from '../../utils/date';

interface DateSwitcherProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

export default function DateSwitcher({ selectedDate, onDateChange }: DateSwitcherProps) {
  const [showPicker, setShowPicker] = useState(false);
  const today = getTodayString();

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.chevron}
          onPress={() => onDateChange(addDays(selectedDate, -1))}
        >
          <Text style={styles.chevronText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.center} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateText}>{formatDateWithDay(selectedDate)}</Text>
          <Text style={styles.calIcon}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chevron, selectedDate === today && styles.chevronDisabled]}
          onPress={() => {
            if (selectedDate < today) onDateChange(addDays(selectedDate, 1));
          }}
          disabled={selectedDate >= today}
        >
          <Text style={[styles.chevronText, selectedDate >= today && styles.chevronTextDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Simple calendar-style date picker modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.pickerCard}>
            <CalendarGrid
              selectedDate={selectedDate}
              onSelect={(d) => {
                onDateChange(d);
                setShowPicker(false);
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

/** Minimal month calendar grid */
function CalendarGrid({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const today = getTodayString();
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate + 'T00:00:00'));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <View>
      {/* Month nav */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth}>
          <Text style={styles.monthChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{months[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth}>
          <Text style={styles.monthChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaderRow}>
        {dayHeaders.map((dh) => (
          <Text key={dh} style={styles.dayHeader}>{dh}</Text>
        ))}
      </View>

      {/* Day cells */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`empty-${i}`} style={styles.cell} />;
          }
          const dateStr = toDateString(new Date(year, month, day));
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const isFuture = dateStr > today;

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.cell,
                isSelected && styles.cellSelected,
                isToday && !isSelected && styles.cellToday,
              ]}
              onPress={() => !isFuture && onSelect(dateStr)}
              disabled={isFuture}
            >
              <Text
                style={[
                  styles.cellText,
                  isSelected && styles.cellTextSelected,
                  isFuture && styles.cellTextFuture,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  chevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronDisabled: { opacity: 0.35 },
  chevronText: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: -2 },
  chevronTextDisabled: { color: colors.textTertiary },
  center: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateText: { ...typography.bodyBold, color: colors.text },
  calIcon: { fontSize: 16 },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  pickerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    ...shadows.lg,
  },

  // Calendar
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  monthChevron: { fontSize: 24, fontWeight: '700', color: colors.primary, paddingHorizontal: spacing.sm },
  monthTitle: { ...typography.bodyBold, color: colors.text },
  dayHeaderRow: { flexDirection: 'row', marginBottom: spacing.sm },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    ...typography.captionBold,
    color: colors.textTertiary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.full,
  },
  cellText: { ...typography.body, color: colors.text },
  cellTextSelected: { color: colors.textInverse, fontWeight: '700' },
  cellTextFuture: { color: colors.textTertiary, opacity: 0.4 },
});
