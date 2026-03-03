import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { BookingStackParamList } from '../types';
import { Colors } from '../constants/colors';

import { GuestLookupScreen } from '../screens/booking/GuestLookupScreen';
import { BookingListScreen } from '../screens/booking/BookingListScreen';
import { BookingDetailScreen } from '../screens/booking/BookingDetailScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator<BookingStackParamList>();

export function BookingStack() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: Colors.text,
        headerBackTitle: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.white },
      }}
    >
      {isLoggedIn ? (
        <Stack.Screen
          name="BookingList"
          component={BookingListScreen}
          options={{ title: '내 예약' }}
        />
      ) : (
        <Stack.Screen
          name="GuestLookup"
          component={GuestLookupScreen}
          options={{ title: '예약 조회' }}
        />
      )}
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: '예약 상세' }}
      />
    </Stack.Navigator>
  );
}
