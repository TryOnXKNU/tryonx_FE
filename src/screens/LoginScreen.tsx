import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

function LoginScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/fontLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.inputContainer}>
        <TextInput placeholder="ID" style={styles.input} />
        <TextInput
          placeholder="PASSWORD"
          secureTextEntry
          style={styles.input}
        />
      </View>
      {/* 로그인 버튼 → Home 이동 */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nonLoginButton}>
        <Text style={styles.nonLoginButtonText}>비회원 주문 조회</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.kakaoButton}>
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
