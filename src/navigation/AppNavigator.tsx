import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import SplashScreen from '../screens/SplashScreen';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, loadToken } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadToken(); // AsyncStorage에서 토큰 불러오기
      setLoading(false);
    };
    init();
  }, [loadToken]);

  if (loading) return <SplashScreen />;

  // AppNavigator.tsx
  return isLoggedIn ? <MainStack /> : <AuthStack />;
}
