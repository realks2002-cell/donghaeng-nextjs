import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList, RootStackParamList } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { API_BASE_URL } from '../../constants/config';
import { Button } from '../../components/Button';
import { MenuItem } from '../../components/MenuItem';
import { Divider } from '../../components/Divider';

type MoreNav = NativeStackNavigationProp<MoreStackParamList>;

export function MoreScreen() {
  const navigation = useNavigation<MoreNav>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Login CTA */}
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>로그인 / 회원가입</Text>
          <Text style={styles.loginDesc}>
            로그인하고 편리하게{'\n'}서비스를 이용하세요
          </Text>
          <Button
            title="로그인하기"
            onPress={() => rootNavigation.navigate('Auth', { screen: 'Login' })}
            size="md"
            style={styles.loginButton}
          />
        </View>

        <Divider />

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loginCard: {
    margin: Spacing.xl,
    padding: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  loginDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  loginButton: {
    minWidth: 160,
  },
  versionText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
});
