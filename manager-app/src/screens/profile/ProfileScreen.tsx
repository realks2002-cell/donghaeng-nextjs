import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';
import { Button } from '../../components/Button';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { manager, logout } = useManagerAuth();

  function handleLogout() {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>마이페이지</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{manager?.name?.charAt(0) || 'M'}</Text>
        </View>
        <Text style={styles.name}>{manager?.name || '매니저'}</Text>
        <Text style={styles.phone}>{manager?.phone || ''}</Text>
      </View>

      <View style={styles.actions}>
        <Button title="로그아웃" variant="outline" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.white },
  name: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  phone: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  actions: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
});
