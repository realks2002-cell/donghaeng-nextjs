import React from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { Button } from '../../components/Button';
import { StepIndicator } from '../../components/StepIndicator';

type Props = NativeStackScreenProps<HomeStackParamList, 'Details'>;

export function DetailsScreen({ navigation }: Props) {
  const { formData, updateFormData } = useServiceRequest();

  function handleNext() {
    navigation.navigate('Confirm');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={6} />

      <View style={styles.content}>
        <Text style={styles.title}>상세 요청사항</Text>
        <Text style={styles.subtitle}>
          매니저에게 전달할 요청사항을 입력해주세요 (선택)
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="예) 어르신 휠체어 이동 도움이 필요합니다.&#10;병원 3층 내과 접수부터 수납까지 동행해주세요."
          value={formData.details}
          onChangeText={(text) => updateFormData({ details: text })}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor={Colors.textTertiary}
        />

        <Text style={styles.charCount}>
          {formData.details.length}/500
        </Text>
      </View>

      <View style={styles.footer}>
        <Button title="다음 →" onPress={handleNext} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.text,
    minHeight: 160,
    backgroundColor: Colors.white,
    lineHeight: 24,
  },
  charCount: {
    textAlign: 'right',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
