import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { Button } from '../../components/Button';
import type { AuthStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function PendingApprovalScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <View style={styles.iconWrap}>
        <Ionicons name="time-outline" size={64} color={Colors.primary} />
      </View>
      <Text style={styles.title}>가입 신청 완료</Text>
      <Text style={styles.desc}>
        관리자 승인 후 로그인할 수 있습니다.{'\n'}
        승인까지 1~2일 정도 소요됩니다.
      </Text>
      <Button
        title="로그인 화면으로"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        style={{ marginTop: Spacing.xxxl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  iconWrap: { marginBottom: Spacing.xxl },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  desc: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
