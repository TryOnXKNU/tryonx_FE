import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import axios from 'axios';

import { useAuthStore } from '../store/useAuthStore'; // zustand 상태
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

type GenderType = 1 | 2; // 1: 남성, 2: 여성,
type BodyType = 1 | 2 | 3; // 체형 타입

export default function EditProfileScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore(); // logout 제거

  // 유저 정보 상태 (초기 빈값 혹은 null)
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>(1);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<GenderType>(1);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const me = response.data;
          setNickname(me.nickname ?? '');
          setPhoneNumber(me.phoneNumber ?? '');
          setBirthDate(me.birthDate ?? '');
          setEmail(me.email ?? '');
          setAddress(me.address ?? '');
          setBodyType(me.bodyType ?? 1);
          setWeight(me.weight ? String(me.weight) : '');
          setHeight(me.weight ? String(me.height) : '');
          setGender(me.gender ?? 1);
          setLoading(false);
        }
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
        Alert.alert('유저 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token]);

  const onSubmit = async () => {
    if (!nicknameChecked) {
      Alert.alert('닉네임 중복 확인을 해주세요.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      Alert.alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const isOldPasswordCorrect = await checkOldPassword();
    if (!isOldPasswordCorrect) {
      Alert.alert('기존 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.put(
        'http://localhost:8080/api/v1/users',
        {
          nickname,
          address,
          oldPassword,
          newPassword,
          gender,
          bodyType,
          weight: Number(weight),
          height: Number(height),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('정보가 성공적으로 수정되었습니다.');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('프로필 수정 실패:', error);
      Alert.alert('수정 실패', error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, styles.loadingContainer]}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  const checkNicknameDuplicate = async () => {
    if (!nickname) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/auth/duplicate-nickname`,
        {
          params: { nickname },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data === true) {
        Alert.alert('사용 가능한 닉네임입니다.');
        setNicknameChecked(true);
      } else {
        Alert.alert('이미 사용 중인 닉네임입니다.');
        setNicknameChecked(false);
      }
    } catch (error) {
      console.error('닉네임 중복 확인 실패:', error);
      Alert.alert('닉네임 중복 확인 중 오류가 발생했습니다.');
    }
  };

  const checkOldPassword = async (): Promise<boolean> => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/users/check-password',
        { password: oldPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data === true;
    } catch (error) {
      console.error('기존 비밀번호 확인 실패:', error);
      Alert.alert('기존 비밀번호 확인 중 오류가 발생했습니다.');
      return false;
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="검색" showRightIcons={true} hideBackButton={false} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* 읽기 전용 정보 */}
        <View style={styles.readOnlyGroup}>
          <LabelText label="이메일(아이디)" />
          <Text style={styles.readOnlyText}>{email}</Text>

          <LabelText label="이름" />
          <Text style={styles.readOnlyText}>{nickname}</Text>

          <LabelText label="전화번호" />
          <Text style={styles.readOnlyText}>{phoneNumber}</Text>

          <LabelText label="생년월일" />
          <Text style={styles.readOnlyText}>{birthDate}</Text>
        </View>

        {/* 닉네임 변경 + 중복확인 */}
        <View style={styles.inputGroup}>
          <LabelText label="닉네임" />
          <View style={styles.nicknameRow}>
            <TextInput
              style={[styles.input, styles.flexOne]}
              value={nickname}
              onChangeText={text => {
                setNickname(text);
                setNicknameChecked(false);
              }}
              placeholder="닉네임 입력"
            />
            <TouchableOpacity
              style={[
                styles.checkBtn,
                nicknameChecked ? styles.checkedBtn : null,
              ]}
              onPress={checkNicknameDuplicate}
            >
              <Text style={styles.checkBtnText}>중복확인</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 배송지 */}
        <View style={styles.inputGroup}>
          <LabelText label="배송지" />
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="배송지 입력"
          />
        </View>

        {/* 기존 비밀번호 */}
        <View style={styles.inputGroup}>
          <LabelText label="기존 비밀번호" />
          <TextInput
            style={styles.input}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="기존 비밀번호 입력"
            secureTextEntry
          />
        </View>

        {/* 새 비밀번호 */}
        <View style={styles.inputGroup}>
          <LabelText label="새 비밀번호" />
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="새 비밀번호 입력"
            secureTextEntry
          />
        </View>

        {/* 새 비밀번호 확인 */}
        <View style={styles.inputGroup}>
          <LabelText label="새 비밀번호 확인" />
          <TextInput
            style={styles.input}
            value={newPasswordConfirm}
            onChangeText={setNewPasswordConfirm}
            placeholder="새 비밀번호 다시 입력"
            secureTextEntry
          />
        </View>

        {/* 체형 선택 */}
        <View style={styles.inputGroup}>
          <LabelText label="체형" />
          <View style={styles.optionRow}>
            {[1, 2, 3].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionBtn,
                  bodyType === type && styles.optionBtnSelected,
                ]}
                onPress={() => setBodyType(type as BodyType)}
              >
                <Text
                  style={[
                    styles.optionText,
                    bodyType === type && styles.optionTextSelected,
                  ]}
                >
                  {['straight', 'natural', 'wave'][type - 1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 키 */}
        <View style={styles.inputGroup}>
          <LabelText label="키 (cm)" />
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="키 입력"
            keyboardType="numeric"
          />
        </View>

        {/* 몸무게 */}
        <View style={styles.inputGroup}>
          <LabelText label="몸무게 (kg)" />
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="몸무게 입력"
            keyboardType="numeric"
          />
        </View>

        {/* 성별 선택 */}
        <View style={styles.inputGroup}>
          <LabelText label="성별" />
          <View style={styles.optionRow}>
            {[1, 2].map(g => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.optionBtn,
                  gender === g && styles.optionBtnSelected,
                ]}
                onPress={() => setGender(g as GenderType)}
              >
                <Text
                  style={[
                    styles.optionText,
                    gender === g && styles.optionTextSelected,
                  ]}
                >
                  {['남성', '여성'][g - 1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
          <Text style={styles.submitBtnText}>적용하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function LabelText({ label }: { label: string }) {
  return <Text style={styles.label}>{label}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexOne: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  readOnlyGroup: {
    marginBottom: 20,
  },
  readOnlyText: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    color: '#555',
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 15,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    marginLeft: 10,
    backgroundColor: '#888',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  checkedBtn: {
    backgroundColor: 'green',
  },
  checkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  optionBtnSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  optionText: {
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
