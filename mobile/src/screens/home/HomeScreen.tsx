import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { SERVICE_TYPES, ServiceType, HomeStackParamList, RootStackParamList } from '../../types';
import { getPricePerHour, formatPrice } from '../../constants/pricing';
import { serviceApi } from '../../api/client';
import { setDynamicPrices } from '../../constants/pricing';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const serviceOrder: ServiceType[] = [
  'hospital_companion',
  'daily_care',
  'life_companion',
  'elderly_care',
  'child_care',
  'other',
];

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoggedIn, user } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    loadPrices();
  }, []);

  async function loadPrices() {
    try {
      const result = await serviceApi.getPrices();
      if (result.prices) {
        setPrices(result.prices);
        setDynamicPrices(result.prices as Record<ServiceType, number>);
      }
    } catch {
      // use defaults
    }
  }

  function handleServicePress(serviceType: ServiceType) {
    navigation.navigate('UserTypeSelect', { preselectedService: serviceType });
  }

  function handleApplyPress() {
    navigation.navigate('UserTypeSelect', {});
  }

  function handleNotificationPress() {
    if (!isLoggedIn) {
      rootNavigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    // Navigate to notification list via MoreStack
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>행복안심동행</Text>
        <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>당신의 안심 돌봄 파트너</Text>
          <Text style={styles.heroSubtitle}>전문 매니저가 함께합니다</Text>
          {isLoggedIn && user && (
            <Text style={styles.greeting}>{user.name}님, 안녕하세요!</Text>
          )}
        </View>

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서비스 카테고리</Text>
          <View style={styles.serviceGrid}>
            {serviceOrder.map((type) => {
              const info = SERVICE_TYPES[type];
              const price = getPricePerHour(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.serviceEmoji}>{info.emoji}</Text>
                  <Text style={styles.serviceLabel}>{info.label}</Text>
                  <Text style={styles.servicePrice}>
                    {formatPrice(price)}/h
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Button
            title="서비스 신청하기 →"
            onPress={handleApplyPress}
            size="lg"
          />
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => {
              const moreNav = navigation.getParent();
              if (moreNav) {
                moreNav.navigate('MoreTab', {
                  screen: 'WebViewPage',
                  params: { url: '/service-guide', title: '이용 안내' },
                });
              }
            }}
          >
            <Text style={styles.quickLinkText}>이용 안내</Text>
          </TouchableOpacity>
          <Text style={styles.quickLinkDivider}>|</Text>
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => {
              const moreNav = navigation.getParent();
              if (moreNav) {
                moreNav.navigate('MoreTab', {
                  screen: 'WebViewPage',
                  params: { url: '/faq', title: 'FAQ' },
                });
              }
            }}
          >
            <Text style={styles.quickLinkText}>FAQ 바로가기</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  notificationButton: {
    padding: Spacing.sm,
  },
  notificationIcon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  heroBanner: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xl,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  serviceCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  serviceEmoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  serviceLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  ctaSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  quickLink: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  quickLinkText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  quickLinkDivider: {
    color: Colors.textTertiary,
  },
});
