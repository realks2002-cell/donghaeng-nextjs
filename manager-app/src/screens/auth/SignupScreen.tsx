import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { managerApi } from '../../api/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import type { AuthStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const BANKS = [
  '국민은행', '신한은행', '하나은행', '우리은행', '농협', '기업은행',
  '카카오뱅크', '토스뱅크', '케이뱅크', '새마을금고', '우체국',
  'SC제일은행', '수협은행', '부산은행', '대구은행', '광주은행', '경남은행',
];
const GENDERS = [
  { label: '남성', value: 'M' },
  { label: '여성', value: 'F' },
];

export function SignupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    ssnFront: '',
    ssnBack: '',
    phone: '',
    address1: '',
    address2: '',
    bank: '',
    accountNumber: '',
    specialty: '',
    password: '',
    passwordConfirm: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return '이름을 입력해주세요.';
    if (!form.gender) return '성별을 선택해주세요.';
    if (!/^\d{6}$/.test(form.ssnFront)) return '주민번호 앞자리 6자리를 입력해주세요.';
    if (!/^\d{7}$/.test(form.ssnBack)) return '주민번호 뒷자리 7자리를 입력해주세요.';
    if (!/^[1-4]/.test(form.ssnBack)) return '주민번호 뒷자리 첫째 자리가 올바르지 않습니다.';
    const phone = form.phone.replace(/-/g, '');
    if (!/^01[016789]\d{7,8}$/.test(phone)) return '유효한 전화번호를 입력해주세요.';
    if (!form.address1.trim()) return '주소를 입력해주세요.';
    if (!form.bank) return '은행을 선택해주세요.';
    if (!form.accountNumber.trim()) return '계좌번호를 입력해주세요.';
    if (form.password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    if (form.password !== form.passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    if (!agreeTerms || !agreePrivacy) return '이용약관 및 개인정보 수집에 동의해주세요.';
    return null;
  }

  async function handleSignup() {
    const error = validate();
    if (error) {
      Alert.alert('입력 오류', error);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('gender', form.gender);
      formData.append('ssn', form.ssnFront + form.ssnBack);
      formData.append('phone', form.phone.replace(/-/g, ''));
      formData.append('address1', form.address1.trim());
      if (form.address2.trim()) formData.append('address2', form.address2.trim());
      formData.append('bank', form.bank);
      formData.append('accountNumber', form.accountNumber.trim());
      if (form.specialty.trim()) formData.append('specialty', form.specialty.trim());
      formData.append('password', form.password);

      await managerApi.signup(formData);
      navigation.replace('PendingApproval');
    } catch (e: any) {
      Alert.alert('회원가입 실패', e.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>매니저 회원가입</Text>
          <Text style={styles.subtitle}>관리자 승인 후 로그인할 수 있습니다</Text>

          {/* 기본 정보 */}
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <Input label="이름 *" placeholder="홍길동" value={form.name} onChangeText={(v) => updateField('name', v)} />

          <Text style={styles.label}>성별 *</Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <Button
                key={g.value}
                title={g.label}
                variant={form.gender === g.value ? 'primary' : 'outline'}
                size="sm"
                onPress={() => updateField('gender', g.value)}
                style={styles.chip}
              />
            ))}
          </View>

          <Text style={styles.label}>주민등록번호 *</Text>
          <View style={styles.ssnRow}>
            <Input
              placeholder="생년월일 6자리"
              value={form.ssnFront}
              onChangeText={(v) => updateField('ssnFront', v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.ssnInput}
            />
            <Text style={styles.ssnDash}>-</Text>
            <Input
              placeholder="*******"
              value={form.ssnBack}
              onChangeText={(v) => updateField('ssnBack', v.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={7}
              secureTextEntry
              style={styles.ssnInput}
            />
          </View>
          <Input
            label="전화번호 *"
            placeholder="01012345678"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            keyboardType="phone-pad"
          />

          {/* 주소 */}
          <Text style={styles.sectionTitle}>주소</Text>
          <Input label="주소 *" placeholder="시/도 시/군/구 동/읍/면" value={form.address1} onChangeText={(v) => updateField('address1', v)} />
          <Input label="상세주소" placeholder="아파트/동/호" value={form.address2} onChangeText={(v) => updateField('address2', v)} />

          {/* 계좌 정보 */}
          <Text style={styles.sectionTitle}>정산 계좌</Text>
          <Text style={styles.label}>은행 *</Text>
          <View style={styles.chipRow}>
            {BANKS.map((b) => (
              <Button
                key={b}
                title={b}
                variant={form.bank === b ? 'primary' : 'outline'}
                size="sm"
                onPress={() => updateField('bank', b)}
                style={styles.chip}
              />
            ))}
          </View>
          <Input
            label="계좌번호 *"
            placeholder="'-' 없이 입력"
            value={form.accountNumber}
            onChangeText={(v) => updateField('accountNumber', v)}
            keyboardType="number-pad"
          />

          {/* 전문 분야 */}
          <Text style={styles.sectionTitle}>추가 정보</Text>
          <Input label="전문 분야" placeholder="예: 간호, 요양보호" value={form.specialty} onChangeText={(v) => updateField('specialty', v)} />

          {/* 비밀번호 */}
          <Text style={styles.sectionTitle}>비밀번호</Text>
          <Input
            label="비밀번호 * (6자 이상)"
            placeholder="비밀번호"
            value={form.password}
            onChangeText={(v) => updateField('password', v)}
            secureTextEntry
          />
          <Input
            label="비밀번호 확인 *"
            placeholder="비밀번호 다시 입력"
            value={form.passwordConfirm}
            onChangeText={(v) => updateField('passwordConfirm', v)}
            secureTextEntry
          />

          {/* 동의 */}
          <View style={styles.agreeSection}>
            <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreeTerms(!agreeTerms)}>
              <Ionicons name={agreeTerms ? 'checkbox' : 'square-outline'} size={22} color={agreeTerms ? Colors.primary : Colors.textTertiary} />
              <Text style={styles.agreeText}>[필수] 이용약관에 동의합니다</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreePrivacy(!agreePrivacy)}>
              <Ionicons name={agreePrivacy ? 'checkbox' : 'square-outline'} size={22} color={agreePrivacy ? Colors.primary : Colors.textTertiary} />
              <Text style={styles.agreeText}>[필수] 개인정보 수집 및 이용에 동의합니다</Text>
            </TouchableOpacity>
          </View>

          <Button title="회원가입" onPress={handleSignup} loading={loading} size="lg" disabled={!agreeTerms || !agreePrivacy} />

          <Button
            title="이미 계정이 있으신가요? 로그인"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ marginTop: Spacing.md }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  content: { paddingHorizontal: Spacing.xxl },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: Spacing.sm,
  },
  label: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.text, marginBottom: Spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  chip: { minWidth: 60 },
  ssnRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  ssnInput: { flex: 1 },
  ssnDash: { fontSize: FontSize.xl, color: Colors.textTertiary },
  agreeSection: { marginTop: Spacing.xl, marginBottom: Spacing.lg },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  agreeText: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
});
