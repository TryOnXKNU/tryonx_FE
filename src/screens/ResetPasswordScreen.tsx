import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ResetPasswordScreen() {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, 'ResetPassword'>>();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const sendCode = async () => {
    if (!email) {
      Alert.alert('이메일을 입력하세요.');
      return;
    }

    try {
      await axios.post('/api/v1/auth/email/send', null, {
        params: { email },
      });
      Alert.alert('인증 코드가 이메일로 전송되었습니다.');
      setCodeSent(true);
    } catch (error) {
      console.error(error);
      Alert.alert(
        '인증 코드 전송 실패',
        '서버와의 통신 중 문제가 발생했습니다.',
      );
    }
  };

  const verifyCode = async () => {
    if (!code) {
      Alert.alert('인증번호를 입력하세요.');
      return;
    }

    try {
      await axios.post('/api/v1/auth/email/verify', null, {
        params: { email, code },
      });
      Alert.alert('이메일 인증이 완료되었습니다.');
      setVerified(true);
    } catch (error) {
      console.error(error);
      Alert.alert('인증 실패', '인증번호가 올바르지 않습니다.');
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      await axios.post('/api/v1/auth/reset-password', {
        email,
        newPassword,
      });

      Alert.alert('비밀번호가 성공적으로 재설정되었습니다.');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('재설정 실패', '비밀번호 재설정 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>비밀번호 재설정</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.label}>이메일</Text>
        <View style={styles.authRow}>
          <TextInput
            style={[styles.input, styles.flex3]}
            placeholder="이메일 입력"
            keyboardType="email-address"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setCodeSent(false);
              setVerified(false);
              setCode('');
            }}
            editable={!verified}
          />
          <TouchableOpacity
            style={[styles.verifyButton, verified && styles.disabledButton]}
            disabled={verified}
            onPress={sendCode}
          >
            <Text style={styles.verifyText}>이메일 발송</Text>
          </TouchableOpacity>
        </View>

        {codeSent && !verified && (
          <View style={styles.authRow}>
            <TextInput
              style={[styles.input, styles.flex3]}
              placeholder="인증번호 입력"
              keyboardType="numeric"
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity style={styles.verifyButton} onPress={verifyCode}>
              <Text style={styles.verifyText}>확인</Text>
            </TouchableOpacity>
          </View>
        )}

        {verified && (
          <>
            <Text style={styles.label}>새 비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="새 비밀번호 입력"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>비밀번호 확인</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 확인 입력"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={resetPassword}
            >
              <Text style={styles.submitButtonText}>비밀번호 재설정하기</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  spacer: { width: 28 },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    height: 48,
  },
  flex3: {
    flex: 3,
  },
  verifyButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginLeft: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  disabledButton: {
    backgroundColor: '#888',
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
