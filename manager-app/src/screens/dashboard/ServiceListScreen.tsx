import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { managerApi } from '../../api/client';
import { SERVICE_TYPE_LABELS } from '../../types';
import type { ServiceRequest } from '../../types';
import { Button } from '../../components/Button';
import { formatDate, formatDuration, formatPrice } from '../../utils/format';

export function ServiceListScreen() {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [applying, setApplying] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await managerApi.getRequests();
      setRequests(data.requests || []);
    } catch (e: any) {
      setError(e.message || '서비스 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  function onRefresh() {
    setRefreshing(true);
    loadRequests();
  }

  async function handleApply() {
    if (!selectedRequest) return;
    setApplying(true);
    try {
      await managerApi.apply(selectedRequest.id);
      Alert.alert('지원 완료', '서비스에 매칭되었습니다.');
      setSelectedRequest(null);
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id));
    } catch (e: any) {
      Alert.alert('지원 실패', e.message || '다시 시도해주세요.');
    } finally {
      setApplying(false);
    }
  }

  function renderItem({ item }: { item: ServiceRequest }) {
    const typeLabel = SERVICE_TYPE_LABELS[item.service_type] || item.service_type;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedRequest(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          {item.vehicle_support && (
            <View style={styles.vehicleBadge}>
              <Ionicons name="car" size={12} color={Colors.info} />
              <Text style={styles.vehicleBadgeText}>차량지원</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {formatDate(item.service_date)} {item.start_time?.slice(0, 5)} ({formatDuration(item.duration_minutes)})
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
          </View>
          {item.details && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>{item.details}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceText}>
            예상 수당 {formatPrice(item.manager_amount || item.estimated_price)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>서비스 요청</Text>
        <Text style={styles.headerCount}>{requests.length}건</Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="다시 시도" variant="outline" size="sm" onPress={loadRequests} style={{ marginTop: Spacing.lg }} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="document-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>현재 가능한 서비스 요청이 없습니다</Text>
            </View>
          }
        />
      )}

      {/* Apply Modal */}
      <Modal visible={!!selectedRequest} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedRequest(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            {selectedRequest && (
              <>
                <Text style={styles.modalTitle}>서비스 지원</Text>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>서비스</Text>
                  <Text style={styles.modalValue}>
                    {SERVICE_TYPE_LABELS[selectedRequest.service_type] || selectedRequest.service_type}
                  </Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>일시</Text>
                  <Text style={styles.modalValue}>
                    {formatDate(selectedRequest.service_date)} {selectedRequest.start_time?.slice(0, 5)}
                  </Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>장소</Text>
                  <Text style={styles.modalValue}>{selectedRequest.address}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>소요시간</Text>
                  <Text style={styles.modalValue}>{formatDuration(selectedRequest.duration_minutes)}</Text>
                </View>
                <View style={styles.modalInfo}>
                  <Text style={styles.modalLabel}>예상 수당</Text>
                  <Text style={[styles.modalValue, { color: Colors.primary, fontWeight: '700' }]}>
                    {formatPrice(selectedRequest.manager_amount || selectedRequest.estimated_price)}
                  </Text>
                </View>
                {selectedRequest.details && (
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalLabel}>요청사항</Text>
                    <Text style={styles.modalValue}>{selectedRequest.details}</Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Button title="취소" variant="outline" onPress={() => setSelectedRequest(null)} style={styles.modalButton} />
                  <Button title="지원하기" onPress={handleApply} loading={applying} style={styles.modalButton} />
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
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
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.info + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  vehicleBadgeText: { fontSize: FontSize.xs, color: Colors.info },
  cardBody: { gap: Spacing.sm, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.lg },
  errorText: { fontSize: FontSize.md, color: Colors.error, marginTop: Spacing.lg, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xl },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  modalValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xxl },
  modalButton: { flex: 1 },
});
