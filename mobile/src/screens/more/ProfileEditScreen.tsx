import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../api/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export function ProfileEditScreen() {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [addressDetail, setAddressDetail] = useState(user?.address_detail || '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('입력 필요', '이름을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/auth/profile', {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        address_detail: addressDetail.trim(),
      });
      await refreshUser();
      Alert.alert('저장 완료', '프로필이 수정되었습니다.');
      navigation.goBack();
    } catch {
      Alert.alert('오류', '프로필 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Input
          label="이름"
          required
          value={name}
          onChangeText={setName}
          placeholder="이름"
        />
        <Input
          label="전화번호"
          value={phone}
          onChangeText={setPhone}
          placeholder="010-0000-0000"
          keyboardType="phone-pad"
        />
        <Input
          label="주소"
          value={address}
          onChangeText={setAddress}
          placeholder="주소"
        />
        <Input
          label="상세주소"
          value={addressDetail}
          onChangeText={setAddressDetail}
          placeholder="상세주소"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="저장"
          onPress={handleSave}
          loading={loading}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
