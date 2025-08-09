import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
//import SplashScreen from '../screens/SplashScreen';
//
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

  // 관리자일 때만 관리자 스택
  if (isLoggedIn && role === 'ADMIN') return <AdminStack />;

  // 기본: 메인 스택 사용 (비로그인도 사용 가능)
  // 로그인/회원가입 화면은 메인 스택 내에서 진입하도록 버튼/가드에서 유도
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
