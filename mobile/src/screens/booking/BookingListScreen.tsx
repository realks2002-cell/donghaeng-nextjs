import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList, ServiceRequest, RequestStatus } from '../../types';
import { STATUS_DISPLAY } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { bookingApi } from '../../api/client';
import { getServiceTypeLabel, getServiceTypeEmoji, formatDate, formatPrice, formatDuration } from '../../utils/format';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<BookingStackParamList>;

const filterTabs: { label: string; statuses: RequestStatus[] | null }[] = [
  { label: '전체', statuses: null },
  { label: '진행중', statuses: ['PENDING_TRANSFER', 'CONFIRMED', 'MATCHED'] },
  { label: '완료', statuses: ['COMPLETED'] },
  { label: '취소', statuses: ['CANCELLED'] },
];

export function BookingListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [bookings, setBookings] = useState<ServiceRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      const result = await bookingApi.getMyBookings();
      setBookings(result.requests as ServiceRequest[]);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }

  const filteredBookings = filterTabs[activeFilter].statuses
    ? bookings.filter((b) => filterTabs[activeFilter].statuses!.includes(b.status))
    : bookings;

  function renderBookingCard({ item }: { item: ServiceRequest }) {
    const statusInfo = STATUS_DISPLAY[item.status];
    return (
      <Card
        onPress={() => navigation.navigate('BookingDetail', { id: item.id })}
        style={styles.bookingCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceLabel}>
            {getServiceTypeEmoji(item.service_type)} {getServiceTypeLabel(item.service_type)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.emoji} {statusInfo.label}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDate}>
          {formatDate(item.service_date)} {item.start_time}
        </Text>
        <Text style={styles.cardInfo}>
          {formatDuration(item.duration_minutes)} | {formatPrice(item.estimated_price)}
        </Text>
        {item.managers && (
          <Text style={styles.cardManager}>매니저: {item.managers.name}</Text>
        )}
      </Card>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {filterTabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.filterTab, activeFilter === index && styles.filterTabActive]}
            onPress={() => setActiveFilter(index)}
          >
            <Text style={[styles.filterTabText, activeFilter === index && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              emoji="📋"
              title="예약 내역이 없습니다"
              description="서비스를 신청하고 예약을 확인해보세요"
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  serviceLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  cardDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardInfo: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  cardManager: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
});
