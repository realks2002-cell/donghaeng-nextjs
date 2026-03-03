import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import type { HomeStackParamList } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { formatPrice } from '../../constants/pricing';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { Button } from '../../components/Button';

type Props = NativeStackScreenProps<HomeStackParamList, 'Completion'>;

export function CompletionScreen({ navigation, route }: Props) {
  const { orderId, amount } = route.params;
  const { clearFormData } = useServiceRequest();

  function handleViewBooking() {
    clearFormData();
    // Navigate to booking tab
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
    const parent = navigation.getParent();
    parent?.navigate('BookingTab');
  }

  function handleGoHome() {
    clearFormData();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.title}>서비스 신청이 완료되었습니다!</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주문번호</Text>
            <Text style={styles.infoValue}>{orderId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>결제금액</Text>
            <Text style={styles.infoValueHighlight}>{formatPrice(amount)}</Text>
          </View>
        </View>

        <Text style={styles.description}>
          매니저가 배정되면{'\n'}알림으로 안내드리겠습니다
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="예약 상세 보기 →"
          onPress={handleViewBooking}
          style={styles.primaryButton}
        />
        <Button
          title="홈으로 돌아가기"
          onPress={handleGoHome}
          variant="outline"
        />
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: FontSize.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    gap: Spacing.md,
  },
  primaryButton: {
    marginBottom: 0,
  },
});
