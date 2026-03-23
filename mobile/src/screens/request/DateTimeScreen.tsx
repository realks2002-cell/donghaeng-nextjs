import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { HomeStackParamList } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { calculatePrice, formatPrice } from '../../constants/pricing';
import { Button } from '../../components/Button';
import { StepIndicator } from '../../components/StepIndicator';

type Props = NativeStackScreenProps<HomeStackParamList, 'DateTime'>;

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
];

const durationOptions = [2, 3, 4, 5, 6, 7, 8];

export function DateTimeScreen({ navigation }: Props) {
  const { formData, updateFormData } = useServiceRequest();

  // Generate next 14 days
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'M월 d일 (EEE)', { locale: ko }),
    };
  });

  function handleNext() {
    if (!formData.serviceDate || !formData.startTime) return;
    navigation.navigate('ManagerSelect');
  }

  const estimatedPrice = formData.serviceType
    ? calculatePrice(formData.serviceType, formData.durationHours)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={4} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <Text style={styles.sectionTitle}>날짜</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {dateOptions.map((date) => (
            <TouchableOpacity
              key={date.value}
              style={[
                styles.chip,
                formData.serviceDate === date.value && styles.chipSelected,
              ]}
              onPress={() => updateFormData({ serviceDate: date.value })}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.serviceDate === date.value && styles.chipTextSelected,
                ]}
              >
                {date.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Selection */}
        <Text style={styles.sectionTitle}>시작 시간</Text>
        <View style={styles.chipGrid}>
          {timeSlots.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeChip,
                formData.startTime === time && styles.chipSelected,
              ]}
              onPress={() => updateFormData({ startTime: time })}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.startTime === time && styles.chipTextSelected,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Duration Selection */}
        <Text style={styles.sectionTitle}>소요 시간</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {durationOptions.map((hours) => (
            <TouchableOpacity
              key={hours}
              style={[
                styles.chip,
                formData.durationHours === hours && styles.chipSelected,
              ]}
              onPress={() => updateFormData({ durationHours: hours })}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.durationHours === hours && styles.chipTextSelected,
                ]}
              >
                {hours}시간
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Price Preview */}
        {formData.serviceType && (
          <View style={styles.pricePreview}>
            <Text style={styles.priceLabel}>예상 금액</Text>
            <Text style={styles.priceValue}>{formatPrice(estimatedPrice)}</Text>
            <Text style={styles.priceDetail}>
              ({formData.serviceType && `${formData.durationHours}시간`})
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="다음 →"
          onPress={handleNext}
          disabled={!formData.serviceDate || !formData.startTime}
        />
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
    paddingTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  horizontalScroll: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  timeChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  pricePreview: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  priceLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  priceDetail: {
    fontSize: FontSize.lg,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
