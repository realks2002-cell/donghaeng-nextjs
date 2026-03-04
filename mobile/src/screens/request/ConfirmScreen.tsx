import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { SERVICE_TYPES } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculatePrice, formatPrice } from '../../constants/pricing';
import { formatDate } from '../../utils/format';
import { serviceApi } from '../../api/client';
import { Button } from '../../components/Button';
import { Divider } from '../../components/Divider';
import { StepIndicator } from '../../components/StepIndicator';
import { BANK_ACCOUNT_INFO } from '../../constants/bank-account';

type Props = NativeStackScreenProps<HomeStackParamList, 'Confirm'>;

export function ConfirmScreen({ navigation }: Props) {
  const { formData, updateFormData } = useServiceRequest();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');

  const serviceInfo = formData.serviceType ? SERVICE_TYPES[formData.serviceType] : null;
  const totalPrice = formData.serviceType
    ? calculatePrice(formData.serviceType, formData.durationHours)
    : 0;

  async function handlePayment() {
    if (!formData.confirmTerms || !formData.cancelTerms) {
      Alert.alert('약관 동의', '필수 약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        customer_id: user?.id || null,
        guest_name: formData.guestName,
        guest_phone: formData.guestPhone,
        address: formData.guestAddress,
        address_detail: formData.guestAddressDetail,
        service_type: formData.serviceType,
        service_date: formData.serviceDate,
        start_time: formData.startTime,
        duration_hours: formData.durationHours,
        designated_manager_id: formData.designatedManagerId,
        details: formData.details,
        estimated_price: totalPrice,
        phone: formData.guestPhone,
        payment_method: paymentMethod === 'card' ? 'CARD' : 'BANK_TRANSFER',
      };

      const result = await serviceApi.saveTempRequest(requestData);

      if (paymentMethod === 'card') {
        navigation.navigate('PaymentWebView', {
          orderId: result.orderId,
          amount: totalPrice,
          orderName: serviceInfo?.label || '돌봄 서비스',
          requestId: result.id,
        });
      } else {
        navigation.navigate('BankTransferCompletion', {
          orderId: result.orderId || result.id,
          amount: totalPrice,
        });
      }
    } catch (error) {
      Alert.alert('오류', '요청 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={7} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Applicant Info */}
        <Text style={styles.sectionTitle}>신청자 정보</Text>
        <View style={styles.infoBlock}>
          <InfoRow label="이름" value={formData.guestName} />
          <InfoRow label="연락처" value={formData.guestPhone} />
          <InfoRow label="주소" value={`${formData.guestAddress} ${formData.guestAddressDetail}`} />
        </View>

        <Divider />

        {/* Service Info */}
        <Text style={styles.sectionTitle}>서비스 정보</Text>
        <View style={styles.infoBlock}>
          <InfoRow label="서비스" value={serviceInfo?.label || ''} />
          <InfoRow label="날짜" value={formData.serviceDate ? formatDate(formData.serviceDate) : ''} />
          <InfoRow
            label="시간"
            value={`${formData.startTime} (${formData.durationHours}시간)`}
          />
          <InfoRow
            label="매니저"
            value={formData.designatedManager?.name || '지정 없음 (자동 매칭)'}
          />
          {formData.details && (
            <InfoRow label="요청사항" value={formData.details} />
          )}
        </View>

        <Divider />

        {/* Price */}
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>결제 금액</Text>
          <Text style={styles.priceValue}>{formatPrice(totalPrice)}</Text>
        </View>

        <Divider />

        {/* Payment Method Selection */}
        <Text style={styles.sectionTitle}>결제 방법</Text>
        <View style={styles.paymentMethodBlock}>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('card')}
          >
            <Text style={styles.paymentOptionEmoji}>💳</Text>
            <Text style={[styles.paymentOptionText, paymentMethod === 'card' && styles.paymentOptionTextSelected]}>
              카드결제
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'bank_transfer' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('bank_transfer')}
          >
            <Text style={styles.paymentOptionEmoji}>🏦</Text>
            <Text style={[styles.paymentOptionText, paymentMethod === 'bank_transfer' && styles.paymentOptionTextSelected]}>
              계좌이체
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bank Account Info (only when bank_transfer selected) */}
        {paymentMethod === 'bank_transfer' && (
          <View style={styles.bankInfoCard}>
            <Text style={styles.bankInfoTitle}>입금 계좌 안내</Text>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>은행</Text>
              <Text style={styles.bankInfoValue}>{BANK_ACCOUNT_INFO.bankName}</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>계좌번호</Text>
              <Text style={styles.bankInfoValue}>{BANK_ACCOUNT_INFO.accountNumber}</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>예금주</Text>
              <Text style={styles.bankInfoValue}>{BANK_ACCOUNT_INFO.accountHolder}</Text>
            </View>
            <View style={[styles.bankInfoRow, styles.bankInfoAmountRow]}>
              <Text style={styles.bankInfoAmountLabel}>입금금액</Text>
              <Text style={styles.bankInfoAmountValue}>{formatPrice(totalPrice)}</Text>
            </View>
            <Text style={styles.bankInfoNotice}>
              ※ 입금 확인 후 서비스 요청이 접수됩니다.
            </Text>
            <Text style={styles.bankInfoNotice}>
              ※ 입금자명은 신청자 이름과 동일하게 입금해주세요.
            </Text>
          </View>
        )}

        <Divider />

        {/* Terms */}
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateFormData({ confirmTerms: !formData.confirmTerms })}
        >
          <View style={[styles.checkboxBox, formData.confirmTerms && styles.checkboxChecked]}>
            {formData.confirmTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>서비스 이용약관 동의 (필수)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => updateFormData({ cancelTerms: !formData.cancelTerms })}
        >
          <View style={[styles.checkboxBox, formData.cancelTerms && styles.checkboxChecked]}>
            {formData.cancelTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>취소/환불 규정 동의 (필수)</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={paymentMethod === 'card' ? '결제하기 →' : '계좌이체 신청 →'}
          onPress={handlePayment}
          loading={loading}
          disabled={!formData.confirmTerms || !formData.cancelTerms}
        />
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoBlock: {
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    width: 80,
  },
  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  priceBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  priceValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  paymentMethodBlock: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    minHeight: 44,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight || '#EBF5FF',
  },
  paymentOptionEmoji: {
    fontSize: 20,
  },
  paymentOptionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  paymentOptionTextSelected: {
    color: Colors.primary,
  },
  bankInfoCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  bankInfoTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: Spacing.xs,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankInfoLabel: {
    fontSize: FontSize.sm,
    color: '#B45309',
  },
  bankInfoValue: {
    fontSize: FontSize.sm,
    color: '#78350F',
    fontWeight: '500',
  },
  bankInfoAmountRow: {
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  bankInfoAmountLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: '#92400E',
  },
  bankInfoAmountValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#78350F',
  },
  bankInfoNotice: {
    fontSize: FontSize.xs,
    color: '#B45309',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
