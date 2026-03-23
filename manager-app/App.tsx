import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ManagerAuthProvider } from './src/contexts/ManagerAuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ManagerAuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </ManagerAuthProvider>
    </SafeAreaProvider>
  );
}
