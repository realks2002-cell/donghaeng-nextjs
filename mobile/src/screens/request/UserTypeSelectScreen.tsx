import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { Colors, FontSize, Spacing } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useServiceRequest } from '../../contexts/ServiceRequestContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StepIndicator } from '../../components/StepIndicator';

type Props = NativeStackScreenProps<HomeStackParamList, 'UserTypeSelect'>;

export function UserTypeSelectScreen({ navigation, route }: Props) {
  const { isLoggedIn, user } = useAuth();
  const { formData, updateFormData, clearFormData, setPreselectedService } = useServiceRequest();

  useEffect(() => {
    clearFormData();
    if (route.params?.preselectedService) {
      setPreselectedService(route.params.preselectedService);
    }
  }, []);

  function selectMember() {
    if (isLoggedIn && user) {
      updateFormData({
        userType: 'member',
        guestName: user.name,
        guestPhone: user.phone,
        guestAddress: user.address || '',
        guestAddressDetail: user.address_detail || '',
      });
      navigation.navigate('ServiceSelect');
    } else {
      navigation.getParent()?.navigate('Auth', { screen: 'Login' });
    }
  }

  function selectGuest() {
    updateFormData({ userType: 'non-member' });
    navigation.navigate('GuestInfo');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StepIndicator totalSteps={7} currentStep={1} />

      <View style={styles.content}>
        <Text style={styles.title}>신청 방법을 선택해주세요</Text>

        <Card
          onPress={selectMember}
          selected={formData.userType === 'member'}
          style={styles.optionCard}
        >
          <View style={styles.optionContent}>
            <View style={styles.radio}>
              {formData.userType === 'member' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>회원으로 신청</Text>
              <Text style={styles.optionDesc}>
                로그인하면 정보가 자동{'\n'}입력됩니다
              </Text>
            </View>
          </View>
        </Card>

        <Card
          onPress={selectGuest}
          selected={formData.userType === 'non-member'}
          style={styles.optionCard}
        >
          <View style={styles.optionContent}>
            <View style={styles.radio}>
              {formData.userType === 'non-member' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>비회원으로 신청</Text>
              <Text style={styles.optionDesc}>
                회원가입 없이 바로{'\n'}서비스를 신청합니다
              </Text>
            </View>
          </View>
        </Card>
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
    paddingTop: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xxl,
  },
  optionCard: {
    marginBottom: Spacing.lg,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  optionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
