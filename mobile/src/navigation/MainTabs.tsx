import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from '../types';
import { Colors, FontSize } from '../constants/colors';

import { HomeStack } from './HomeStack';
import { BookingStack } from './BookingStack';
import { GuideStack } from './GuideStack';
import { MoreStack } from './MoreStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  if (focused) {
    return (
      <View style={styles.activeIconWrap}>
        <Ionicons name={name} size={20} color={Colors.white} />
      </View>
    );
  }
  return (
    <View style={styles.inactiveIconWrap}>
      <Ionicons name={name} size={20} color={Colors.tabBarInactive} />
    </View>
  );
}

export function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brandTeal,
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
          tabBarLabel: '내 예약 확인',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="GuideTab"
        component={GuideStack}
        options={{
          tabBarLabel: '이용안내',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'book' : 'book-outline'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={MoreStack}
        options={{
          tabBarLabel: '로그인',
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
  activeIconWrap: {
    backgroundColor: Colors.brandTeal,
    borderRadius: 17,
    width: 33,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
  },
  inactiveIconWrap: {
    width: 33,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
  },
});
