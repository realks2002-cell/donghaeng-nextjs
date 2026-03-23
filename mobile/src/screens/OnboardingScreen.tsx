import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ViewToken } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/colors';
import { Button } from '../components/Button';
import { setItem } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '🏥',
    title: '전문 돌봄 서비스',
    description: '병원동행, 가사돌봄, 생활동행 등\n다양한 돌봄 서비스를 제공합니다',
  },
  {
    emoji: '👨‍⚕️',
    title: '검증된 매니저',
    description: '꼼꼼한 검증을 거친\n전문 돌봄 매니저를 매칭합니다',
  },
  {
    emoji: '📱',
    title: '간편한 신청',
    description: '회원가입 없이도\n바로 서비스를 신청할 수 있습니다',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
  navigation?: unknown;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  async function handleComplete() {
    await setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    onComplete();
  }

  function handleNext() {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <Button
            title={currentIndex === slides.length - 1 ? '시작하기' : '다음'}
            onPress={handleNext}
          />
          {currentIndex < slides.length - 1 && (
            <Button
              title="건너뛰기"
              onPress={handleComplete}
              variant="ghost"
              style={styles.skipButton}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  buttons: {
    gap: Spacing.sm,
  },
  skipButton: {
    marginTop: Spacing.xs,
  },
});
