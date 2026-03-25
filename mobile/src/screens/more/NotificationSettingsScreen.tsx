import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, Alert, Platform } from 'react-native';
let Notifications: any = null;
try { Notifications = require('expo-notifications'); } catch { Notifications = null; }
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { pushApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { setItem, getItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/config';
import { Divider } from '../../components/Divider';

export function NotificationSettingsScreen() {
  const { user } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  async function checkNotificationStatus() {
    if (!Notifications) return;
    const { status } = await Notifications.getPermissionsAsync();
    setPushEnabled(status === 'granted');
  }

  async function togglePush(value: boolean) {
    if (value) {
      setLoading(true);
      try {
        if (!Notifications) { Alert.alert('알림', 'Expo Go에서는 푸시 알림을 사용할 수 없습니다.'); setLoading(false); return; }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          const tokenData = await Notifications.getExpoPushTokenAsync();
          await setItem(STORAGE_KEYS.PUSH_TOKEN, tokenData.data);
          await pushApi.subscribe(tokenData.data, user?.id);
          setPushEnabled(true);
        } else {
          Alert.alert('알림 권한', '설정에서 알림 권한을 허용해주세요.');
        }
      } catch {
        Alert.alert('오류', '알림 설정에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    } else {
      setPushEnabled(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>푸시 알림</Text>
          <Text style={styles.rowDesc}>매칭 완료, 서비스 알림 등을 받습니다</Text>
        </View>
        <Switch
          value={pushEnabled}
          onValueChange={togglePush}
          disabled={loading}
          trackColor={{ true: Colors.primary, false: Colors.border }}
        />
      </View>

      <Divider />

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>알림 종류</Text>
        <NotificationItem title="매니저 매칭 완료" desc="매니저가 배정되었을 때" />
        <NotificationItem title="서비스 시작 1시간 전" desc="서비스 시작 전 리마인더" />
        <NotificationItem title="서비스 완료" desc="서비스가 완료되었을 때" />
        <NotificationItem title="환불 처리 완료" desc="환불이 처리되었을 때" />
      </View>
    </SafeAreaView>
  );
}

function NotificationItem({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{title}</Text>
      <Text style={styles.notificationDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  rowText: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  rowTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  rowDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  infoTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  notificationItem: {
    paddingVertical: Spacing.md,
  },
  notificationTitle: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  notificationDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
