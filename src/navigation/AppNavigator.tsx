import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
//import SplashScreen from '../screens/SplashScreen';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import AdminStack from './AdminStack';

export default function AppNavigator() {
  //const [loading, setLoading] = useState(true);

  //  const { isLoggedIn, role, loadAuth } = useAuthStore();
  const { isLoggedIn, role } = useAuthStore();

  // useEffect(() => {
  //   const init = async () => {
  //     await loadAuth();
  //     setLoading(false);
  //   };
  //   init();
  // }, [loadAuth]);

  // if (loading) return <SplashScreen />;

  if (!isLoggedIn) return <AuthStack />;

  // 로그인됨 → role로 분기
  if (role === 'ADMIN') return <AdminStack />;
  return <MainStack />;

  // const { isLoggedIn, loadToken } = useAuthStore();

  // useEffect(() => {
  //   const init = async () => {
  //     await loadToken(); // AsyncStorage에서 토큰 불러오기
  //     setLoading(false);
  //   };
  //   init();
  // }, [loadToken]);

  // if (loading) return <SplashScreen />;

  // // AppNavigator.tsx
  // return isLoggedIn ? <MainStack /> : <AuthStack />;
}
