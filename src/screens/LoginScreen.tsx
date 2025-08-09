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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, getProfile } from '@react-native-seoul/kakao-login';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(
    null,
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setIsKakaoLoading(true);
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
    } finally {
      setIsKakaoLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Image
            source={require('../assets/images/fontLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.fullWidth}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>반갑습니다</Text>
              <Text style={styles.cardSubtitle}>
                이메일과 비밀번호로 로그인하세요
              </Text>

              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Icon
                    name="mail-outline"
                    size={20}
                    color={focusedField === 'email' ? '#fff' : '#8A8A8A'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="이메일"
                    placeholderTextColor="#8A8A8A"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                  />
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused,
                  ]}
                >
                  <Icon
                    name="lock-closed-outline"
                    size={20}
                    color={focusedField === 'password' ? '#fff' : '#8A8A8A'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="비밀번호"
                    placeholderTextColor="#8A8A8A"
                    secureTextEntry={!isPasswordVisible}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(prev => !prev)}
                    style={styles.passwordToggle}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isPasswordVisible ? '비밀번호 가리기' : '비밀번호 보기'
                    }
                  >
                    <Icon
                      name={
                        isPasswordVisible ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={20}
                      color="#B5B5B5"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.loginButtonText}>로그인</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.nonLoginButton}>
                <Text style={styles.nonLoginButtonText}>비회원 주문 조회</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>또는</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={[
                  styles.kakaoButton,
                  isKakaoLoading && styles.buttonDisabled,
                ]}
                onPress={handleKakaoLogin}
                disabled={isKakaoLoading}
              >
                {isKakaoLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <View style={styles.kakaoInner}>
                    <Icon
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color="#000"
                    />
                    <Text style={styles.kakaoButtonText}>카카오 로그인</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>

          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.link}>회원가입</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>|</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FindId')}>
              <Text style={styles.link}>아이디 찾기</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>|</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Text style={styles.link}>비밀번호 재설정</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 100,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#B5B5B5',
    marginTop: 6,
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  inputWrapperFocused: {
    borderColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#fff',
  },
  passwordToggle: {
    padding: 6,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nonLoginButton: {
    width: '100%',
    height: 52,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  nonLoginButtonText: {
    color: '#E5E5E5',
    fontSize: 16,
    fontWeight: 'bold',
  },

  kakaoButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#FEE500',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  kakaoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kakaoButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    color: '#8A8A8A',
    marginHorizontal: 10,
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  linkContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  link: {
    color: '#D4D4D4',
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 6,
    color: '#7A7A7A',
  },
  fullWidth: {
    width: '100%',
  },
});
