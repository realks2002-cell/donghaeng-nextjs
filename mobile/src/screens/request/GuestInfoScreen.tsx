import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/StepIndicator';

type Props = NativeStackScreenProps<HomeStackParamList, 'GuestInfo'>;

export function GuestInfoScreen({ navigation }: Props) {
  const { formData, updateFormData } = useServiceRequest();
  const [privacyChecked, setPrivacyChecked] = useState(formData.privacyConsent);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.guestName.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    const phoneClean = formData.guestPhone.replace(/\D/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      newErrors.phone = '올바른 전화번호를 입력해주세요';
    }

    if (!formData.guestAddress.trim()) {
      newErrors.address = '주소를 입력해주세요';
    }

    if (!privacyChecked) {
      newErrors.privacy = '개인정보 수집·이용에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    updateFormData({ privacyConsent: privacyChecked });
    navigation.navigate('ServiceSelect');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={2} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="이름"
          required
          placeholder="이름을 입력하세요"
          value={formData.guestName}
          onChangeText={(text) => updateFormData({ guestName: text })}
          error={errors.name}
        />

        <Input
          label="전화번호"
          required
          placeholder="010-0000-0000"
          value={formData.guestPhone}
          onChangeText={(text) => updateFormData({ guestPhone: text })}
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Input
          label="주소"
          required
          placeholder="주소를 입력하세요"
          value={formData.guestAddress}
          onChangeText={(text) => updateFormData({ guestAddress: text })}
          error={errors.address}
        />

        <Input
          label="상세주소"
          placeholder="상세주소를 입력하세요"
          value={formData.guestAddressDetail}
          onChangeText={(text) => updateFormData({ guestAddressDetail: text })}
        />

        {/* Privacy Consent */}
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setPrivacyChecked(!privacyChecked)}
        >
          <View style={[styles.checkboxBox, privacyChecked && styles.checkboxChecked]}>
            {privacyChecked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>개인정보 수집·이용 동의</Text>
        </TouchableOpacity>
        {errors.privacy && <Text style={styles.errorText}>{errors.privacy}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="다음 →" onPress={handleNext} />
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
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
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
    marginLeft: 34,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
