import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import SplashScreen from './src/screens/SplashScreen';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      await useAuthStore.getState().loadToken();
      setLoading(false);
    };
    loadAuth();
  }, []);

  if (loading) {
    return <SplashScreen />; // 간단히 로딩 화면 띄우기
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
