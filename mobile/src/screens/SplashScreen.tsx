import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '../constants/colors';

const FULL_TEXT = '행복안심동행';
const TYPING_INTERVAL = 150;
const AFTER_DELAY = 1000;

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [charIndex, setCharIndex] = useState(0);
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= FULL_TEXT.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, TYPING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (charIndex === FULL_TEXT.length) {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(onFinish, AFTER_DELAY);
      return () => clearTimeout(timer);
    }
  }, [charIndex]);

  const displayed = FULL_TEXT.slice(0, charIndex);
  const prefix = displayed.slice(0, Math.min(charIndex, 4));
  const suffix = displayed.slice(4);

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="heart-outline" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>
          {prefix}
          {suffix ? <Text style={styles.titleOrange}>{suffix}</Text> : null}
          <Text style={styles.cursor}>|</Text>
        </Text>
      </View>

      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        전문 교육을 이수한 매니저가 함께합니다.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    backgroundColor: '#F97316',
    padding: 10,
    borderRadius: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  titleOrange: {
    color: '#F97316',
  },
  cursor: {
    color: '#F97316',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
