import React from 'react';
import { StyleSheet, Linking, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from '../types';
import { Colors, FontSize } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

import { HomeStack } from './HomeStack';
import { BookingStack } from './BookingStack';
import { MoreStack } from './MoreStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

function DummyScreen() {
  return <View />;
}

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  return <Ionicons name={name} size={20} color={focused ? Colors.tabBarActive : Colors.tabBarInactive} />;
}

export function MainTabs() {
  const { isLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 14,
        },
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="BookingTab"
        component={BookingStack}
        options={{
          tabBarLabel: isLoggedIn ? '내 예약' : '예약조회',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CallTab"
        component={DummyScreen}
        options={{
          tabBarLabel: '상담/예약',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'call' : 'call-outline'} focused={focused} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Linking.openURL('tel:1668-5535');
          },
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{
          tabBarLabel: isLoggedIn ? '마이페이지' : '더보기',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
