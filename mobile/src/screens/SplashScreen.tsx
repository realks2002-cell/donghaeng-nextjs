import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💙</Text>
      <Text style={styles.title}>행복안심동행</Text>
      <Text style={styles.subtitle}>당신의 안심 돌봄 파트너</Text>
      <ActivityIndicator
        color={Colors.white}
        style={styles.loader}
        size="small"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});
