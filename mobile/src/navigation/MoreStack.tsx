import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

import { MoreScreen } from '../screens/more/MoreScreen';
import { MyPageScreen } from '../screens/more/MyPageScreen';
import { ProfileEditScreen } from '../screens/more/ProfileEditScreen';
import { NotificationSettingsScreen } from '../screens/more/NotificationSettingsScreen';
import { NotificationListScreen } from '../screens/more/NotificationListScreen';
import { WebViewScreen } from '../screens/more/WebViewScreen';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreStack() {
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
          name="MyPage"
          component={MyPageScreen}
          options={{ title: '마이페이지' }}
        />
      ) : (
        <Stack.Screen
          name="More"
          component={MoreScreen}
          options={{ title: '더보기' }}
        />
      )}
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: '프로필 수정' }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: '알림 설정' }}
      />
      <Stack.Screen
        name="NotificationList"
        component={NotificationListScreen}
        options={{ title: '알림' }}
      />
      <Stack.Screen
        name="WebViewPage"
        component={WebViewScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </Stack.Navigator>
  );
}
