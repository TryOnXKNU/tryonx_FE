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
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

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

  const onSubmit = () => {
    if (!agree1 || !agree2) {
      Alert.alert('개인정보 동의가 필요합니다.');
      return;
    }
    if (!userIdVerified) {
      Alert.alert('아이디 인증이 필요합니다.');
      return;
    }
    if (!phoneVerified) {
      Alert.alert('휴대폰 인증이 필요합니다.');
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
    Alert.alert('회원가입 완료!');
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
        <TextInput
          placeholder="이름"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        {/* 아이디 + 인증번호 + 인증버튼 */}
        <Text style={styles.label}>아이디</Text>
        <View style={styles.authRow}>
          <TextInput
            placeholder="아이디 입력"
            style={[styles.input, styles.flex3]}
            value={userId}
            onChangeText={text => {
              setUserId(text);
              setUserIdVerified(false); // 변경 시 인증 초기화
            }}
            editable={!userIdVerified}
          />
          <TouchableOpacity
            style={[
              styles.verifyButton,
              userIdVerified && styles.disabledButton,
            ]}
            disabled={userIdVerified}
            onPress={() => {
              if (!userId) {
                Alert.alert('아이디를 입력하세요.');
                return;
              }
              Alert.alert('아이디 인증번호 발송됨');
              // 실제 인증번호 발송 로직 추가 필요
            }}
          >
            <Text style={styles.verifyText}>인증받기</Text>
          </TouchableOpacity>
        </View>

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
              userIdVerified && styles.disabledButton,
            ]}
            disabled={userIdVerified}
            onPress={() => {
              if (userIdCode === '1234') {
                setUserIdVerified(true);
                Alert.alert('아이디 인증 완료');
              } else {
                Alert.alert('인증번호가 올바르지 않습니다.');
              }
            }}
          >
            <Text style={styles.verifyText}>확인</Text>
          </TouchableOpacity>
        </View>

        {/* 휴대폰 + 인증번호 + 인증버튼 */}
        <Text style={styles.label}>휴대폰</Text>
        <View style={styles.authRow}>
          <TextInput
            placeholder="휴대폰 번호 입력"
            style={[styles.input, styles.flex3]}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={text => {
              setPhone(text);
              setPhoneVerified(false);
            }}
            editable={!phoneVerified}
          />
          <TouchableOpacity
            style={[
              styles.verifyButton,
              phoneVerified && styles.disabledButton,
            ]}
            disabled={phoneVerified}
            onPress={() => {
              if (!phone) {
                Alert.alert('휴대폰 번호를 입력하세요.');
                return;
              }
              Alert.alert('휴대폰 인증번호 발송됨');
              // 실제 인증번호 발송 로직 추가 필요
            }}
          >
            <Text style={styles.verifyText}>인증받기</Text>
          </TouchableOpacity>
        </View>

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
              phoneVerified && styles.disabledButton,
            ]}
            disabled={phoneVerified}
            onPress={() => {
              if (phoneCode === '5678') {
                setPhoneVerified(true);
                Alert.alert('휴대폰 인증 완료');
              } else {
                Alert.alert('인증번호가 올바르지 않습니다.');
              }
            }}
          >
            <Text style={styles.verifyText}>확인</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="비밀번호"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder="비밀번호 확인"
          secureTextEntry
          style={styles.input}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />

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
          <Text>{birthday.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthday}
            mode="date"
            display="spinner"
            onChange={(
              event: DateTimePickerEvent,
              selectedDate?: Date | undefined,
            ) => {
              if (selectedDate) {
                setBirthday(selectedDate);
                setShowDatePicker(false);
              } else {
                // Android에서 취소 시 selectedDate는 undefined
                setShowDatePicker(false);
              }
            }}
            maximumDate={new Date()}
          />
        )}

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

        <TextInput
          placeholder="키 (cm)"
          style={styles.input}
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />
        <TextInput
          placeholder="몸무게 (kg)"
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
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
});
