import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getItem } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isSplashDone, setIsSplashDone] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  async function checkOnboarding() {
    const completed = await getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    setShowOnboarding(completed !== 'true');
  }

  if (isLoading || showOnboarding === null) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  if (!isSplashDone) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding && (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen {...props} onComplete={() => setShowOnboarding(false)} />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Auth modal navigator
function AuthNavigator() {
  const AuthStack = createNativeStackNavigator();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: '로그인' }}
      />
      <AuthStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: '회원가입' }}
      />
    </AuthStack.Navigator>
  );
}
