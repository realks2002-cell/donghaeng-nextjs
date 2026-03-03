import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookingStackParamList, ServiceRequest } from '../../types';
import { STATUS_DISPLAY } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { bookingApi } from '../../api/client';
import { getServiceTypeLabel, getServiceTypeEmoji, formatDate, formatPrice, formatDuration, maskPhoneNumber } from '../../utils/format';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingDetail'>;

export function BookingDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function loadDetail() {
    try {
      const result = await bookingApi.getDetail(id);
      setRequest(result.request as ServiceRequest);
    } catch {
      Alert.alert('오류', '예약 정보를 불러올 수 없습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    Alert.alert(
      '예약 취소',
      '정말 예약을 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예, 취소합니다',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await bookingApi.cancel(id);
              Alert.alert('취소 완료', '예약이 취소되었습니다.');
              navigation.goBack();
            } catch {
              Alert.alert('오류', '취소 처리 중 오류가 발생했습니다.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!request) return null;

  const statusInfo = STATUS_DISPLAY[request.status];
  const canCancel = ['PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'MATCHING'].includes(request.status);
  const payment = request.payments?.[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusInfo.color + '15' }]}>
          <Text style={[styles.statusEmoji]}>{statusInfo.emoji}</Text>
          <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

        {/* Service Info */}
        <Text style={styles.sectionTitle}>서비스 정보</Text>
        <InfoRow label="서비스" value={`${getServiceTypeEmoji(request.service_type)} ${getServiceTypeLabel(request.service_type)}`} />
        <InfoRow label="날짜" value={formatDate(request.service_date)} />
        <InfoRow label="시간" value={`${request.start_time} (${formatDuration(request.duration_minutes)})`} />
        <InfoRow label="금액" value={formatPrice(request.estimated_price)} highlight />

        <Divider />

        {/* Manager Info */}
        {request.managers && (
          <>
            <Text style={styles.sectionTitle}>매니저 정보</Text>
            <View style={styles.managerCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{request.managers.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.managerName}>{request.managers.name}</Text>
                <Text style={styles.managerPhone}>{maskPhoneNumber(request.managers.phone)}</Text>
              </View>
            </View>
            <Divider />
          </>
        )}

        {/* Details */}
        {request.details && (
          <>
            <Text style={styles.sectionTitle}>상세 요청사항</Text>
            <Text style={styles.detailsText}>{request.details}</Text>
            <Divider />
          </>
        )}

        {/* Payment Info */}
        {payment && (
          <>
            <Text style={styles.sectionTitle}>결제 정보</Text>
            <InfoRow label="결제수단" value={payment.method || '카드결제'} />
            <InfoRow label="결제금액" value={formatPrice(payment.amount)} />
            <InfoRow label="결제상태" value={payment.status === 'DONE' ? '결제완료' : payment.status} />
          </>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <View style={styles.cancelSection}>
            <Button
              title="예약 취소"
              onPress={handleCancel}
              variant="danger"
              loading={cancelling}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loader: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  statusEmoji: {
    fontSize: 20,
  },
  statusLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  infoValueHighlight: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  managerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  managerName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  managerPhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailsText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  cancelSection: {
    marginTop: Spacing.xxl,
  },
});
