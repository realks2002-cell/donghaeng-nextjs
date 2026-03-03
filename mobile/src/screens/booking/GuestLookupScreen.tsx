import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BookingStackParamList, RootStackParamList, ServiceRequest } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { bookingApi } from '../../api/client';
import { getServiceTypeLabel, getServiceTypeEmoji, formatDate, formatPrice, formatDuration } from '../../utils/format';
import { STATUS_DISPLAY } from '../../types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Divider } from '../../components/Divider';

type BookingNav = NativeStackNavigationProp<BookingStackParamList>;

export function GuestLookupScreen() {
  const navigation = useNavigation<BookingNav>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [results, setResults] = useState<ServiceRequest[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('입력 필요', '이름과 전화번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await bookingApi.guestLookup(name.trim(), phone.trim());
      setResults(result.requests as ServiceRequest[]);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>예약하신 서비스를 조회하세요</Text>

        <Input
          label="이름"
          placeholder="이름을 입력하세요"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="전화번호"
          placeholder="010-0000-0000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Button
          title="예약 조회하기"
          onPress={handleSearch}
          loading={loading}
        />

        {searched && results.length === 0 && (
          <Text style={styles.noResult}>조회된 예약이 없습니다</Text>
        )}

        {results.map((request) => {
          const statusInfo = STATUS_DISPLAY[request.status];
          return (
            <Card
              key={request.id}
              onPress={() => navigation.navigate('BookingDetail', { id: request.id })}
              style={styles.resultCard}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.serviceLabel}>
                  {getServiceTypeEmoji(request.service_type)} {getServiceTypeLabel(request.service_type)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.emoji} {statusInfo.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardDate}>{formatDate(request.service_date)} {request.start_time}</Text>
              <Text style={styles.cardPrice}>
                {formatDuration(request.duration_minutes)} | {formatPrice(request.estimated_price)}
              </Text>
            </Card>
          );
        })}

        <Divider spacing={Spacing.xxl} />

        <Text style={styles.loginPrompt}>회원이신가요?</Text>
        <Button
          title="로그인하고 내 예약 보기 →"
          onPress={() => rootNavigation.navigate('Auth', { screen: 'Login' })}
          variant="ghost"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  noResult: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xxl,
  },
  resultCard: {
    marginTop: Spacing.lg,
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
  cardPrice: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginPrompt: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
});
