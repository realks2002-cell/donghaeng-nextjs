import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Colors, FontSize, Spacing, BorderRadius } from '../../constants/colors';
import { SERVICE_TYPES, ServiceType, HomeStackParamList, RootStackParamList } from '../../types';
import { serviceApi } from '../../api/client';
import { setDynamicPrices } from '../../constants/pricing';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/config';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const SERVICE_CARDS: Array<{
  type: ServiceType;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
}> = [
  { type: 'hospital_companion', icon: 'medkit-outline', iconColor: '#1A6B5A', bgColor: '#FDECEC' },
  { type: 'daily_care', icon: 'home-outline', iconColor: '#B85C38', bgColor: '#FFF5E0' },
  { type: 'life_companion', icon: 'bag-handle-outline', iconColor: '#2D7A4A', bgColor: '#E8F8EF' },
  { type: 'elderly_care', icon: 'people-outline', iconColor: '#1A6B5A', bgColor: '#F3E8FA' },
  { type: 'child_care', icon: 'happy-outline', iconColor: '#B85C38', bgColor: '#E8F4FD' },
];

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoggedIn, user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadPrices();
  }, []);

  async function loadPrices() {
    try {
      const result = await serviceApi.getPrices();
      if (result.prices) {
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
  }

  function handleCallPress() {
    Linking.openURL('tel:1668-5535');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ backgroundColor: '#F97316', padding: 6, borderRadius: 10 }}>
            <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>행복안심<Text style={{ color: '#F97316' }}>동행</Text></Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.heroTitle, { marginBottom: 0 }]}>당신의 일상에 </Text>
              <MaskedView maskElement={<Text style={[styles.heroTitle, { marginBottom: 0 }]}>따뜻한</Text>}>
                <LinearGradient colors={['#F97316', '#F59E0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={[styles.heroTitle, { opacity: 0, marginBottom: 0 }]}>따뜻한</Text>
                </LinearGradient>
              </MaskedView>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaskedView maskElement={<Text style={[styles.heroTitle, { marginBottom: 0 }]}>동행</Text>}>
                <LinearGradient colors={['#F97316', '#F59E0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={[styles.heroTitle, { opacity: 0, marginBottom: 0 }]}>동행</Text>
                </LinearGradient>
              </MaskedView>
              <Text style={[styles.heroTitle, { marginBottom: 0 }]}>을 선물합니다.</Text>
            </View>
          </View>
          <Text style={[styles.heroSubtitle, { marginTop: Spacing.md }]}>전문 교육을 이수한 매니저가 함께합니다.</Text>
        </View>

        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>서비스 카테고리</Text>
          <View style={styles.serviceGrid}>
            {SERVICE_CARDS.map((card) => {
              const info = SERVICE_TYPES[card.type];
              return (
                <View key={card.type} style={styles.serviceItem}>
                  <TouchableOpacity
                    style={[styles.serviceCard, { backgroundColor: card.bgColor }]}
                    onPress={() => handleServicePress(card.type)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={card.icon} size={32} color={card.iconColor} />
                  </TouchableOpacity>
                  <Text style={styles.serviceLabel}>{info.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleApplyPress} activeOpacity={0.8}>
            <Text style={styles.ctaText}>서비스 신청하기  →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickLinkRow}
            onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/refund`, title: '환불 정책' })}
            activeOpacity={0.7}
          >
            <View style={styles.quickLinkIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.brandTeal} />
            </View>
            <Text style={styles.quickLinkText}>환불 정책</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.brandTeal} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickLinkRow}
            onPress={() => navigation.navigate('WebViewPage', { url: `${API_BASE_URL}/faq`, title: 'FAQ' })}
            activeOpacity={0.7}
          >
            <View style={styles.quickLinkIconWrap}>
              <Ionicons name="help-circle-outline" size={18} color={Colors.brandTeal} />
            </View>
            <Text style={styles.quickLinkText}>FAQ 바로가기</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.brandTeal} />
          </TouchableOpacity>
        </View>

        {/* Consultation Banner */}
        <View style={styles.consultSection}>
          <TouchableOpacity style={styles.consultBanner} onPress={handleCallPress} activeOpacity={0.8}>
            <View style={styles.consultContent}>
              <Text style={styles.consultTitle}>상담이 필요하신가요?</Text>
              <Text style={styles.consultSubtitle}>연중무휴 24시간 전문 상담사가 대기 중입니다.</Text>
            </View>
            <View style={styles.consultIconWrap}>
              <Ionicons name="call" size={22} color={Colors.white} />
            </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg + 40,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  heroBanner: {
    backgroundColor: Colors.heroBg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
    padding: Spacing.xxl,
    borderRadius: BorderRadius.xl,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.brandTeal,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.brandTeal,
    fontWeight: '500',
    textAlign: 'center',
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
    gap: Spacing.lg,
    justifyContent: 'flex-start',
  },
  serviceItem: {
    width: '28.5%',
    alignItems: 'center',
  },
  serviceCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.text,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: Spacing.xl + 20,
    marginBottom: Spacing.xxl,
  },
  ctaButton: {
    backgroundColor: '#F97316',
    borderRadius: BorderRadius.full,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  refundLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  refundLinkText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  quickLinks: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  quickLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  quickLinkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
  },
  consultSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  consultBanner: {
    backgroundColor: Colors.consultBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  consultContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  consultTitle: {
    fontSize: FontSize.md * 0.9,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  consultSubtitle: {
    fontSize: FontSize.xs * 0.9,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  consultIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.consultAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
