import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export function ProfileEditScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.center}>
        <Ionicons name="construct-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.text}>프로필 수정 기능은 추후 업데이트 예정입니다</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  text: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.lg, textAlign: 'center' },
});
