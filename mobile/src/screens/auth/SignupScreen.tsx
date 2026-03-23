import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = '이름을 입력해주세요';
    if (!phone.trim()) newErrors.phone = '전화번호를 입력해주세요';
    if (!email.trim()) newErrors.email = '이메일을 입력해주세요';
    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    if (password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    if (password !== passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignup() {
    if (!validate()) return;

    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        address: address.trim() || undefined,
        addressDetail: addressDetail.trim() || undefined,
      });
      // After signup + auto-login, go back to main
      const parent = navigation.getParent();
      if (parent) {
        parent.goBack();
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('회원가입 실패', error.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Input
          label="이름"
          required
          placeholder="이름"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <Input
          label="전화번호"
          required
          placeholder="010-0000-0000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <Input
          label="이메일"
          required
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        <Input
          label="비밀번호"
          required
          placeholder="6자 이상"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        <Input
          label="비밀번호 확인"
          required
          placeholder="비밀번호 재입력"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          error={errors.passwordConfirm}
        />
        <Input
          label="주소"
          placeholder="주소 (선택)"
          value={address}
          onChangeText={setAddress}
        />
        <Input
          label="상세주소"
          placeholder="상세주소 (선택)"
          value={addressDetail}
          onChangeText={setAddressDetail}
        />

        <Button
          title="회원가입"
          onPress={handleSignup}
          loading={loading}
          style={styles.submitButton}
        />

        <View style={{ height: 40 }} />
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
    paddingTop: Spacing.xl,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
