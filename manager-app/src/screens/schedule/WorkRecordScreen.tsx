import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { managerApi } from '../../api/client';
import { SERVICE_TYPE_LABELS, STATUS_LABELS } from '../../types';
import type { ScheduleRecord } from '../../types';
import { Button } from '../../components/Button';
import { formatDate, formatDuration, formatPrice } from '../../utils/format';

const STATUS_COLORS: Record<string, string> = {
  MATCHED: Colors.info,
  COMPLETED: Colors.success,
  CONFIRMED: Colors.warning,
  CANCELLED: Colors.error,
  PENDING_TRANSFER: Colors.textTertiary,
};

interface Section {
  title: string;
  data: ScheduleRecord[];
}

export function WorkRecordScreen() {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      setError(null);
      const data = await managerApi.getSchedule();
      setRecords(data.records || []);
    } catch (e: any) {
      setError(e.message || '근무기록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function onRefresh() {
    setRefreshing(true);
    loadRecords();
  }

  async function handleComplete(id: string) {
    Alert.alert('서비스 완료', '서비스를 완료 처리하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: async () => {
          setCompleting(id);
          try {
            await managerApi.completeService(id);
            setRecords((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: 'COMPLETED' } : r))
            );
            Alert.alert('완료', '서비스가 완료 처리되었습니다.');
          } catch (e: any) {
            Alert.alert('오류', e.message || '다시 시도해주세요.');
          } finally {
            setCompleting(null);
          }
        },
      },
    ]);
  }

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
  const upcoming = records.filter((r) => r.service_date >= today && r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const past = records.filter((r) => r.service_date < today || r.status === 'COMPLETED' || r.status === 'CANCELLED');

  const sections: Section[] = [];
  if (upcoming.length > 0) sections.push({ title: '예정된 서비스', data: upcoming });
  if (past.length > 0) sections.push({ title: '지난 서비스', data: past });

  function renderItem({ item }: { item: ScheduleRecord }) {
    const typeLabel = SERVICE_TYPE_LABELS[item.service_type] || item.service_type;
    const statusLabel = STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status;
    const statusColor = STATUS_COLORS[item.status] || Colors.textTertiary;
    const isMatched = item.status === 'MATCHED';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {formatDate(item.service_date)} {item.start_time?.slice(0, 5)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{formatDuration(item.duration_minutes)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.customer_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>{item.final_price ? formatPrice(item.final_price) : '가격 미정'}</Text>
          {isMatched && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleComplete(item.id)}
              disabled={completing === item.id}
            >
              {completing === item.id ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.completeButtonText}>서비스 완료</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>근무기록</Text>
        <Text style={styles.headerCount}>{records.length}건</Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="다시 시도" variant="outline" size="sm" onPress={loadRecords} style={{ marginTop: Spacing.lg }} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="time-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>근무기록이 없습니다</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  headerCount: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  list: { padding: Spacing.lg },
  sectionHeader: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeader: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  typeBadge: {
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  cardBody: { gap: Spacing.sm, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  completeButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  completeButtonText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.white },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.lg },
  errorText: { fontSize: FontSize.md, color: Colors.error, marginTop: Spacing.lg, textAlign: 'center' },
});
