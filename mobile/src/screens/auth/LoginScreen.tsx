import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleLogin() {
    const newErrors: Record<string, string> = {};
    if (!phone.trim()) newErrors.phone = '전화번호를 입력해주세요';
    if (!password) newErrors.password = '비밀번호를 입력해주세요';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await login(phone.trim(), password);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '전화번호 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>행복안심동행</Text>

        <Input
          label="전화번호"
          placeholder="010-0000-0000"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
          autoFocus
        />

        <Input
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <Button
          title="로그인"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
        />

        <View style={styles.signupPrompt}>
          <Text style={styles.signupText}>아직 회원이 아니신가요?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>회원가입하기 →</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: Spacing.xxxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  signupPrompt: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    gap: Spacing.sm,
  },
  signupText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  signupLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
});
