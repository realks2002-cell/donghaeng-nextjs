import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList, ServiceType } from '../../types';
import { SERVICE_TYPES } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { getPricePerHour, formatPrice } from '../../constants/pricing';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { Button } from '../../components/Button';
import { StepIndicator } from '../../components/StepIndicator';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceSelect'>;

const serviceOrder: ServiceType[] = [
  'hospital_companion',
  'daily_care',
  'life_companion',
  'elderly_care',
  'child_care',
];

export function ServiceSelectScreen({ navigation }: Props) {
  const { formData, updateFormData } = useServiceRequest();

  function handleNext() {
    if (!formData.serviceType) return;
    navigation.navigate('DateTime');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={3} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>어떤 서비스가 필요하신가요?</Text>

        <View style={styles.grid}>
          {serviceOrder.map((type) => {
            const info = SERVICE_TYPES[type];
            const price = getPricePerHour(type);
            const isSelected = formData.serviceType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                onPress={() => updateFormData({ serviceType: type })}
                activeOpacity={0.7}
              >
                <Text style={styles.serviceEmoji}>{info.emoji}</Text>
                <Text style={[styles.serviceLabel, isSelected && styles.serviceLabelSelected]}>
                  {info.label}
                </Text>
                <Text style={styles.servicePrice}>{formatPrice(price)}/h</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="다음 →"
          onPress={handleNext}
          disabled={!formData.serviceType}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  serviceCard: {
    width: '47%',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  serviceCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  serviceEmoji: {
    fontSize: 36,
    marginBottom: Spacing.md,
  },
  serviceLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  serviceLabelSelected: {
    color: Colors.primary,
  },
  servicePrice: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
