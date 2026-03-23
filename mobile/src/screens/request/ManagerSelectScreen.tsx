import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList, Manager } from '../../types';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { serviceApi } from '../../api/client';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/StepIndicator';

type Props = NativeStackScreenProps<HomeStackParamList, 'ManagerSelect'>;

export function ManagerSelectScreen({ navigation }: Props) {
  const { formData, updateFormData } = useServiceRequest();
  const [searchQuery, setSearchQuery] = useState('');
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const result = await serviceApi.searchManagers(searchQuery.trim());
      setManagers(result.managers as Manager[]);
      setSearched(true);
    } catch {
      setManagers([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function selectManager(manager: Manager) {
    updateFormData({
      designatedManagerId: manager.id,
      designatedManager: {
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
        photo_url: manager.photo_url || undefined,
      },
    });
  }

  function handleNext() {
    navigation.navigate('Details');
  }

  function handleSkip() {
    updateFormData({ designatedManagerId: null, designatedManager: null });
    navigation.navigate('Details');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={5} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>매니저를 지정하시겠어요?</Text>
        <Text style={styles.subtitle}>
          선택사항입니다. 건너뛰면 자동으로 매칭됩니다.
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Input
              placeholder="이름 또는 전화번호로 검색"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <Button
            title="검색"
            onPress={handleSearch}
            size="md"
            fullWidth={false}
            style={styles.searchButton}
          />
        </View>

        {loading && <ActivityIndicator color={Colors.primary} style={styles.loader} />}

        {searched && managers.length === 0 && !loading && (
          <Text style={styles.noResult}>검색 결과가 없습니다</Text>
        )}

        {managers.map((manager) => {
          const isSelected = formData.designatedManagerId === manager.id;
          return (
            <Card
              key={manager.id}
              onPress={() => selectManager(manager)}
              selected={isSelected}
              style={styles.managerCard}
            >
              <View style={styles.managerInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {manager.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.managerDetails}>
                  <Text style={styles.managerName}>{manager.name}</Text>
                  <Text style={styles.managerPhone}>{manager.phone}</Text>
                  {manager.specialty?.length > 0 && (
                    <Text style={styles.managerSpecialty}>
                      {manager.specialty.join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {formData.designatedManagerId ? (
          <Button title="다음 →" onPress={handleNext} />
        ) : (
          <Button title="건너뛰기 →" onPress={handleSkip} variant="outline" />
        )}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    marginTop: 0,
    minHeight: 48,
  },
  loader: {
    marginVertical: Spacing.xl,
  },
  noResult: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xl,
  },
  managerCard: {
    marginBottom: Spacing.md,
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
  },
  managerDetails: {
    flex: 1,
  },
  managerName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  managerPhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  managerSpecialty: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 34,
    paddingTop: Spacing.lg,
  },
});
