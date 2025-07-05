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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';

export default function FindIdScreen() {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, 'FindId'>>();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);

  // 예시 중 하나 (sendCode)
  const sendCode = async () => {
    if (!phone) {
      Alert.alert('휴대폰 번호를 입력하세요.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/auth/sms/send?phoneNumber=${phone}`,
        { method: 'POST' },
      );

      if (response.ok) {
        Alert.alert('인증번호가 발송되었습니다.');
        setCodeSent(true);
      } else {
        Alert.alert('인증 요청 실패');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('오류 발생', error.message);
      } else {
        Alert.alert('오류 발생', '알 수 없는 오류');
      }
    }
  };

  const verifyCode = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/auth/sms/verify?phoneNumber=${phone}&code=${code}`,
        { method: 'POST' },
      );

      if (response.ok) {
        Alert.alert('인증 완료');
        setVerified(true);
      } else {
        Alert.alert('인증 실패');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('오류 발생', error.message);
      } else {
        Alert.alert('오류 발생', '알 수 없는 오류');
      }
    }
  };

  const findId = async () => {
    if (!verified) {
      Alert.alert('휴대폰 인증이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/auth/find-id',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: phone }),
        },
      );

      if (response.ok) {
        const userId = await response.text();
        Alert.alert('아이디 확인', `회원님의 아이디는 ${userId} 입니다.`, [
          {
            text: '확인',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert('아이디 찾기 실패');
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('오류 발생', error.message);
      } else {
        Alert.alert('오류 발생', '알 수 없는 오류');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>아이디 찾기</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.label}>휴대폰 번호</Text>
        <View style={styles.authRow}>
          <TextInput
            style={[styles.input, styles.flex3]}
            placeholder="휴대폰 번호 입력"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={text => {
              setPhone(text);
              setVerified(false);
              setCodeSent(false);
              setCode('');
            }}
            editable={!verified}
          />
          <TouchableOpacity
            style={[styles.verifyButton, verified && styles.disabledButton]}
            disabled={verified}
            onPress={sendCode}
          >
            <Text style={styles.verifyText}>인증번호 받기</Text>
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

        <TouchableOpacity style={styles.submitButton} onPress={findId}>
          <Text style={styles.submitButtonText}>아이디 찾기</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
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
