import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { GuideStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { WebViewScreen } from '../screens/more/WebViewScreen';

const Stack = createNativeStackNavigator<GuideStackParamList>();

export function GuideStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: Colors.text,
        headerBackTitle: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Colors.white },
      }}
    >
      <Stack.Screen
        name="Guide"
        component={WebViewScreen}
        options={{ title: '이용안내' }}
        initialParams={{ url: 'https://donghaeng77.co.kr/service-guide', title: '이용안내' }}
      />
      <Stack.Screen
        name="WebViewPage"
        component={WebViewScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
    </Stack.Navigator>
  );
}
