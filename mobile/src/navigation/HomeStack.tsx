import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types';
import { ServiceRequestProvider } from '../contexts/ServiceRequestContext';
import { Colors } from '../constants/colors';

import { HomeScreen } from '../screens/home/HomeScreen';
import { UserTypeSelectScreen } from '../screens/request/UserTypeSelectScreen';
import { GuestInfoScreen } from '../screens/request/GuestInfoScreen';
import { ServiceSelectScreen } from '../screens/request/ServiceSelectScreen';
import { DateTimeScreen } from '../screens/request/DateTimeScreen';
import { ManagerSelectScreen } from '../screens/request/ManagerSelectScreen';
import { DetailsScreen } from '../screens/request/DetailsScreen';
import { ConfirmScreen } from '../screens/request/ConfirmScreen';
import { PaymentWebViewScreen } from '../screens/request/PaymentWebViewScreen';
import { CompletionScreen } from '../screens/request/CompletionScreen';
import { BankTransferCompletionScreen } from '../screens/request/BankTransferCompletionScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

function RequestWizardScreens() {
  return (
    <>
      <Stack.Screen
        name="UserTypeSelect"
        component={UserTypeSelectScreen}
        options={{ title: '서비스 신청' }}
      />
      <Stack.Screen
        name="GuestInfo"
        component={GuestInfoScreen}
        options={{ title: '신청자 정보' }}
      />
      <Stack.Screen
        name="ServiceSelect"
        component={ServiceSelectScreen}
        options={{ title: '서비스 선택' }}
      />
      <Stack.Screen
        name="DateTime"
        component={DateTimeScreen}
        options={{ title: '날짜/시간 선택' }}
      />
      <Stack.Screen
        name="ManagerSelect"
        component={ManagerSelectScreen}
        options={{ title: '매니저 지정' }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: '상세 요청사항' }}
      />
      <Stack.Screen
        name="Confirm"
        component={ConfirmScreen}
        options={{ title: '신청 확인' }}
      />
      <Stack.Screen
        name="PaymentWebView"
        component={PaymentWebViewScreen}
        options={{ title: '결제' }}
      />
      <Stack.Screen
        name="Completion"
        component={CompletionScreen}
        options={{ title: '신청 완료', headerLeft: () => null, gestureEnabled: false }}
      />
      <Stack.Screen
        name="BankTransferCompletion"
        component={BankTransferCompletionScreen}
        options={{ title: '신청 접수', headerLeft: () => null, gestureEnabled: false }}
      />
    </>
  );
}

export function HomeStack() {
  return (
    <ServiceRequestProvider>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: Colors.text,
          headerBackTitle: '',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.white },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        {RequestWizardScreens()}
      </Stack.Navigator>
    </ServiceRequestProvider>
  );
}
