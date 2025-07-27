import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, getProfile } from '@react-native-seoul/kakao-login';

function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //const setToken = useAuthStore(state => state.setToken);
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      //  const token = getQueryParamFromUrl(url, 'token'); // code -> token으로 변경
      const token = getQueryParamFromUrl(url, 'token');
      const role = getQueryParamFromUrl(url, 'role'); // role도 추가

      if (token && role) {
        try {
          setAuth(token, role as 'USER' | 'ADMIN'); // Zustand 스토어에 저장
          Alert.alert('로그인 성공', '메인 화면으로 이동합니다.');
          navigation.navigate('Main');
        } catch (error) {
          console.error('토큰 처리 실패:', error);
          Alert.alert('로그인 실패', '토큰 처리 중 오류 발생');
        }
      }
    };

    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [navigation, setAuth]);

  const getQueryParamFromUrl = (url: string, key: string): string | null => {
    const match = url.match(new RegExp('[?&]' + key + '=([^&]+)'));
    return match ? decodeURIComponent(match[1]) : null;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/v1/auth/login', {
        email,
        password,
      });

      const { token, role } = res.data; // role도 서버에서 받아온다고 가정
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userRole', role);
      setAuth(token, role);

      Alert.alert('로그인 성공', '메인 화면으로 이동합니다.');

      // navigation.navigate('Main');
    } catch (error) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const token = await login();
      if (!token) {
        Alert.alert('카카오 로그인 실패', '로그인에 실패했습니다.');
        return;
      }

      const profile = await getProfile();
      const payload = { accessToken: token.accessToken };

      const res = await axios.post(
        'http://localhost:8080/api/v1/auth/kakao',
        payload,
      );
      const { token: serverToken, role } = res.data;

      if (!serverToken) {
        Alert.alert('서버 오류', '토큰을 받지 못했습니다.');
        return;
      }

      await AsyncStorage.setItem('authToken', serverToken);
      await AsyncStorage.setItem('userRole', role ?? 'USER');

      setAuth(serverToken, role ?? 'USER');

      Alert.alert('로그인 성공', `${profile.nickname}님 환영합니다!`);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      Alert.alert('카카오 로그인 실패', '네트워크 또는 서버 오류');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/fontLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="ID"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="PASSWORD"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.nonLoginButton}>
        <Text style={styles.nonLoginButtonText}>비회원 주문 조회</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>회원가입</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FindId')}>
          <Text style={styles.link}>아이디 찾기</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.link}>비밀번호 재설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 120,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nonLoginButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#D4D4D4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nonLoginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  kakaoButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FEE500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  kakaoButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  link: {
    color: '#fff',
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 6,
    color: '#aaa',
  },
});
