import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';

const bodyTypes = ['straight', 'natural', 'wave', 'none'];
const genders = ['남자', '여자'];

export default function SignUpScreen() {
  const navigation =
    useNavigation<NavigationProp<RootStackParamList, 'SignUp'>>();

  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [userIdCode, setUserIdCode] = useState('');
  const [userIdVerified, setUserIdVerified] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [gender, setGender] = useState<string | null>(null);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [weightError, setWeightError] = useState('');

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = (pw: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(pw);
  const isNumberOnly = (value: string) => /^\d+$/.test(value);
  const isPhoneValid = (inputPhone: string) => {
    return /^01[016789][0-9]{7,8}$/.test(inputPhone);
  };

  const sendEmailCode = async () => {
    if (!userId) return Alert.alert('아이디(이메일)를 입력해주세요.');
    try {
      await axios.post('/api/v1/auth/email/send', null, {
        params: { email: userId },
      });
      Alert.alert('이메일 인증번호가 전송되었습니다.');
    } catch {
      Alert.alert('이메일 전송 실패', '유효한 이메일인지 확인하세요.');
    }
  };

  const verifyEmailCode = async () => {
    if (!userId || !userIdCode)
      return Alert.alert('아이디와 인증번호를 입력해주세요.');
    try {
      await axios.post('/api/v1/auth/email/verify', null, {
        params: { email: userId, code: userIdCode },
      });
      setUserIdVerified(true);
      Alert.alert('이메일 인증 완료');
    } catch {
      Alert.alert('이메일 인증 실패', '인증번호가 올바르지 않습니다.');
    }
  };

  const sendSmsCode = async () => {
    if (!phone) return Alert.alert('휴대폰 번호를 입력해주세요.');
    try {
      await axios.post('/api/v1/auth/sms/send', null, {
        params: { phoneNumber: phone },
      });
      Alert.alert('휴대폰 인증번호가 전송되었습니다.');
    } catch {
      Alert.alert('인증번호 전송 실패', '유효한 번호인지 확인하세요.');
    }
  };

  const verifySmsCode = async () => {
    if (!phone || !phoneCode)
      return Alert.alert('휴대폰 번호와 인증번호를 입력해주세요.');
    try {
      await axios.post('/api/v1/auth/sms/verify', null, {
        params: { phoneNumber: phone, code: phoneCode },
      });
      setPhoneVerified(true);
      Alert.alert('휴대폰 인증 완료');
    } catch {
      Alert.alert('휴대폰 인증 실패', '인증번호가 올바르지 않습니다.');
    }
  };

  const onSubmit = async () => {
    if (
      !name ||
      !nickname ||
      !password ||
      !passwordConfirm ||
      !userId ||
      !phone
    ) {
      Alert.alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (!agree1) {
      Alert.alert('개인정보 수집 동의는 필수입니다.');
      return;
    }

    if (!userIdVerified || !phoneVerified) {
      Alert.alert('이메일과 휴대폰 인증을 완료해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!gender) {
      Alert.alert('성별을 선택해주세요.');
      return;
    }

    if (!isNumberOnly(height) || !isNumberOnly(weight)) {
      Alert.alert('키와 몸무게는 숫자만 입력해주세요.');
      return;
    }

    try {
      const res = await axios.post('/api/v1/auth/signup', {
        name,
        email: userId,
        phoneNumber: phone,
        password,
        nickname,
        bodyType: bodyTypes.indexOf(selectedBodyType || 'none'),
        birthDate: birthday.toISOString().split('T')[0],
        gender: genders.indexOf(gender),
        height: parseInt(height, 10),
        weight: parseInt(weight, 10),
      });

      if (res.status === 200) {
        Alert.alert('회원가입 완료!', '', [
          {
            text: '확인',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        '회원가입 실패',
        error?.response?.data?.message || '잠시 후 다시 시도해주세요.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원가입</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.authRow}>
          <TextInput
            placeholder="이름"
            style={[styles.input, styles.flex3]}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.label}>아이디</Text>
        <View style={styles.authRow}>
          <TextInput
            placeholder="아이디 (이메일)"
            style={[styles.input, styles.flex3]}
            value={userId}
            onChangeText={text => {
              setUserId(text);
              setEmailError(
                isEmailValid(text) ? '' : '이메일 형식으로 입력해주세요.',
              );
              setUserIdVerified(false);
            }}
          />

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isEmailValid(userId) || userIdVerified) &&
                styles.disabledButton,
            ]}
            disabled={!isEmailValid(userId) || userIdVerified}
            onPress={sendEmailCode}
          >
            <Text style={styles.verifyText}>인증받기</Text>
          </TouchableOpacity>
        </View>

        {emailError !== '' && (
          <Text style={styles.errorText}>{emailError}</Text>
        )}

        <View style={styles.authRow}>
          <TextInput
            placeholder="인증번호 입력"
            style={[styles.input, styles.flex3]}
            value={userIdCode}
            onChangeText={setUserIdCode}
            editable={!userIdVerified}
          />
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (userIdVerified || userIdCode.length === 0) &&
                styles.disabledButton,
            ]}
            disabled={userIdVerified || userIdCode.length === 0}
            onPress={verifyEmailCode}
          >
            <Text style={styles.verifyText}>확인</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>휴대폰</Text>
        <View style={styles.authRow}>
          <TextInput
            placeholder="휴대폰 번호"
            style={[styles.input, styles.flex3]}
            keyboardType="numeric"
            value={phone}
            onChangeText={inputPhone => {
              setPhone(inputPhone);
              setPhoneError(
                isPhoneValid(inputPhone) ? '' : '숫자만 입력해주세요.',
              );
            }}
          />

          {/* <TouchableOpacity
            style={[
              styles.verifyButton,
              phoneVerified && styles.disabledButton,
            ]}
            disabled={phoneVerified}
            onPress={sendSmsCode}
          >
            <Text style={styles.verifyText}>인증받기</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isPhoneValid(phone) || phoneVerified) && styles.disabledButton,
            ]}
            disabled={!isPhoneValid(phone) || phoneVerified}
            onPress={sendSmsCode}
          >
            <Text style={styles.verifyText}>인증받기</Text>
          </TouchableOpacity>
        </View>

        {phoneError !== '' && (
          <Text style={styles.errorText}>{phoneError}</Text>
        )}

        <View style={styles.authRow}>
          <TextInput
            placeholder="인증번호 입력"
            style={[styles.input, styles.flex3]}
            keyboardType="numeric"
            value={phoneCode}
            onChangeText={setPhoneCode}
            editable={!phoneVerified}
          />
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (phoneVerified || phoneCode.length === 0) &&
                styles.disabledButton,
            ]}
            disabled={phoneVerified || phoneCode.length === 0}
            onPress={verifySmsCode}
          >
            <Text style={styles.verifyText}>확인</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.authRow}>
          <TextInput
            placeholder="비밀번호"
            secureTextEntry
            style={[styles.input, styles.flex3]}
            value={password}
            onChangeText={inputText => {
              setPassword(inputText);
              setPasswordError(
                isPasswordValid(inputText)
                  ? ''
                  : '영문, 숫자, 특수문자 포함 8자리 이상 입력해주세요.',
              );
            }}
          />
        </View>
        {passwordError !== '' && (
          <Text style={styles.errorText}>{passwordError}</Text>
        )}

        <View style={styles.authRow}>
          <TextInput
            placeholder="비밀번호 확인"
            secureTextEntry
            style={[styles.input, styles.flex3]}
            value={passwordConfirm}
            onChangeText={text => {
              setPasswordConfirm(text);
              setConfirmError(
                text !== password ? '비밀번호가 일치하지 않습니다.' : '',
              );
            }}
          />
        </View>
        {confirmError !== '' && (
          <Text style={styles.errorText}>{confirmError}</Text>
        )}

        <View style={styles.row}>
          <TextInput
            placeholder="닉네임"
            style={[styles.input, styles.flex1]}
            value={nickname}
            onChangeText={setNickname}
          />
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={() => Alert.alert('닉네임 중복확인')}
          >
            <Text style={styles.verifyText}>중복확인</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>체형 선택</Text>
        <View style={styles.bodyTypeRow}>
          {bodyTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.bodyTypeButton,
                selectedBodyType === type && styles.bodyTypeSelected,
              ]}
              onPress={() => setSelectedBodyType(type)}
            >
              <Text
                style={[
                  styles.bodyTypeText,
                  selectedBodyType === type && styles.bodyTypeTextSelected,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>생년월일</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.text}>{birthday.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={birthday}
          onConfirm={date => {
            setBirthday(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
          maximumDate={new Date()}
        />

        {/* 성별 라디오 버튼 */}
        <Text style={[styles.label, styles.marginTop12]}>성별</Text>
        <View style={styles.genderRow}>
          {genders.map(g => (
            <TouchableOpacity
              key={g}
              style={styles.genderOption}
              onPress={() => setGender(g)}
            >
              <View
                style={[
                  styles.radioCircle,
                  gender === g && styles.radioSelected,
                ]}
              />
              <Text style={styles.genderText}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.authRow}>
          <TextInput
            placeholder="키 (cm)"
            style={[styles.input, styles.flex3]}
            keyboardType="numeric"
            value={height}
            onChangeText={text => {
              setHeight(text);
              setHeightError(isNumberOnly(text) ? '' : '숫자만 입력해주세요.');
            }}
          />
          {heightError !== '' && (
            <Text style={styles.errorText}>{heightError}</Text>
          )}
        </View>

        <View style={styles.authRow}>
          <TextInput
            placeholder="몸무게 (kg)"
            style={[styles.input, styles.flex3]}
            keyboardType="numeric"
            value={weight}
            onChangeText={text => {
              setWeight(text);
              setWeightError(/^\d*$/.test(text) ? '' : '숫자만 입력해주세요.');
            }}
          />
        </View>
        {weightError !== '' && (
          <Text style={styles.errorText}>{weightError}</Text>
        )}

        <View style={styles.agreeRow}>
          <TouchableOpacity
            onPress={() => setAgree1(!agree1)}
            style={styles.checkbox}
          >
            <View style={[styles.checkboxBox, agree1 && styles.checkedBox]} />
          </TouchableOpacity>
          <Text style={styles.agreeText}>개인정보 수집 동의 (필수)</Text>
        </View>

        <View style={styles.agreeRow}>
          <TouchableOpacity
            onPress={() => setAgree2(!agree2)}
            style={styles.checkbox}
          >
            <View style={[styles.checkboxBox, agree2 && styles.checkedBox]} />
          </TouchableOpacity>
          <Text style={styles.agreeText}>마케팅 정보 수신 동의 (선택)</Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>회원정보 완료하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  flex1: {
    flex: 1,
  },
  flex3: {
    flex: 3,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  authRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  verifyButton: {
    height: 48,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginLeft: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#888',
  },
  verifyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  marginTop12: {
    marginTop: 12,
  },
  bodyTypeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bodyTypeButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  bodyTypeSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  bodyTypeText: {
    fontSize: 14,
  },
  bodyTypeTextSelected: {
    color: '#fff',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48, // 높이 추가
    justifyContent: 'center', // 텍스트 가운데 정렬
  },

  genderRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#000',
  },
  genderText: {
    fontSize: 16,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
  },
  checkedBox: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  agreeText: {
    fontSize: 14,
    color: '#333',
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
  },
  spacer: { width: 28 },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});
