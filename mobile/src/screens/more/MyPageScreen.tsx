import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { API_BASE_URL } from '../../constants/config';
import { useAuth } from '../../contexts/AuthContext';
import { formatPhoneNumber } from '../../utils/format';
import { Button } from '../../components/Button';
import { MenuItem } from '../../components/MenuItem';
import { Divider } from '../../components/Divider';

type MoreNav = NativeStackNavigationProp<MoreStackParamList>;

export function MyPageScreen() {
  const navigation = useNavigation<MoreNav>();
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || ''}</Text>
            <Text style={styles.profilePhone}>
              {user?.phone ? formatPhoneNumber(user.phone) : ''}
            </Text>
            {user?.address && (
              <Text style={styles.profileAddress}>{user.address}</Text>
            )}
          </View>
          <Button
            title="프로필 수정"
            onPress={() => navigation.navigate('ProfileEdit')}
            variant="outline"
            size="sm"
            fullWidth={false}
          />
        </View>

        <Divider />

        <MenuItem
          title="알림 설정"
          onPress={() => navigation.navigate('NotificationSettings')}
        />
        <MenuItem
          title="서비스 안내"
          onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/service-guide`, title: '서비스 안내' })}
        />
        <MenuItem
          title="자주 묻는 질문 (FAQ)"
          onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/faq`, title: 'FAQ' })}
        />
        <MenuItem
          title="회사 소개"
          onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/about`, title: '회사 소개' })}
        />
        <MenuItem
          title="매니저 지원 안내"
          onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/manager/recruit`, title: '매니저 지원' })}
        />

        <Divider />

        <MenuItem
          title="이용약관"
          onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/terms`, title: '이용약관' })}
        />
        <MenuItem
          title="개인정보 처리방침"
          onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/privacy`, title: '개인정보 처리방침' })}
        />
        <MenuItem
          title="앱 버전"
          showArrow={false}
          rightContent={<Text style={styles.versionText}>1.0.0</Text>}
          onPress={() => {}}
        />

        <Divider />

        <View style={styles.logoutSection}>
          <Button
            title="로그아웃"
            onPress={handleLogout}
            variant="ghost"
            textStyle={styles.logoutText}
          />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  profilePhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileAddress: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  versionText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  logoutSection: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  logoutText: {
    color: Colors.error,
  },
});
