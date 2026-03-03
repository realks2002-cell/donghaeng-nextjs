import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { EmptyState } from '../../components/EmptyState';

export function NotificationListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <EmptyState
        emoji="🔔"
        title="알림이 없습니다"
        description="새로운 알림이 오면 여기에 표시됩니다"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
