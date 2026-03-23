import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import type { HomeStackParamList } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { formatPrice } from '../../constants/pricing';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { Button } from '../../components/Button';
import { BANK_ACCOUNT_INFO } from '../../constants/bank-account';

type Props = NativeStackScreenProps<HomeStackParamList, 'BankTransferCompletion'>;

export function BankTransferCompletionScreen({ navigation, route }: Props) {
  const { orderId, amount } = route.params;
  const { clearFormData } = useServiceRequest();

  function handleViewBooking() {
    clearFormData();
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
        <Text style={styles.emoji}>🏦</Text>
        <Text style={styles.title}>서비스 요청이 접수되었습니다</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>주문번호</Text>
            <Text style={styles.infoValue}>{orderId.slice(0, 8)}...</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>결제방법</Text>
            <Text style={styles.infoValue}>계좌이체</Text>
          </View>
        </View>

        {/* 계좌 정보 */}
        <View style={styles.bankCard}>
          <Text style={styles.bankTitle}>입금 계좌 안내</Text>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>은행</Text>
            <Text style={styles.bankValue}>{BANK_ACCOUNT_INFO.bankName}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>계좌번호</Text>
            <Text style={styles.bankValue}>{BANK_ACCOUNT_INFO.accountNumber}</Text>
          </View>
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>예금주</Text>
            <Text style={styles.bankValue}>{BANK_ACCOUNT_INFO.accountHolder}</Text>
          </View>
          <View style={[styles.bankRow, styles.bankAmountRow]}>
            <Text style={styles.bankAmountLabel}>입금금액</Text>
            <Text style={styles.bankAmountValue}>{formatPrice(amount)}</Text>
          </View>
        </View>

        <Text style={styles.description}>
          입금 확인 후{'\n'}매니저 배정이 진행됩니다
        </Text>
        <Text style={styles.notice}>
          입금자명은 신청자 이름과 동일하게 입금해주세요
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
    marginBottom: Spacing.xl,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.lg,
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
  bankCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: Spacing.xl,
    width: '100%',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  bankTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: Spacing.sm,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankLabel: {
    fontSize: FontSize.sm,
    color: '#B45309',
  },
  bankValue: {
    fontSize: FontSize.sm,
    color: '#78350F',
    fontWeight: '500',
  },
  bankAmountRow: {
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  bankAmountLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#92400E',
  },
  bankAmountValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#78350F',
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  notice: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
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
