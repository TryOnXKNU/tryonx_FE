import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditNickname'>;

export default function EditNicknameScreen({ navigation }: Props) {
  const { token } = useAuthStore();
  const [currentNickname, setCurrentNickname] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameChecked, setNicknameChecked] = useState(false);

  useEffect(() => {
    const fetchCurrentNickname = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentNickname(res.data.nickname || '-');
      } catch (error) {
        Alert.alert('기존 닉네임을 불러오는데 실패했습니다.');
      }
    };

    fetchCurrentNickname();
  }, [token]);

  const checkNicknameDuplicate = async () => {
    if (!nickname) {
      Alert.alert('닉네임을 입력해주세요.');
      return;
    }
    try {
      const res = await axios.get(
        'http://localhost:8080/api/v1/auth/duplicate-nickname',
        {
          params: { nickname },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data === true) {
        Alert.alert('사용 가능한 닉네임입니다.');
        setNicknameChecked(true);
      } else {
        Alert.alert('이미 사용 중인 닉네임입니다.');
        setNicknameChecked(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('중복 확인 실패');
    }
  };

  const onSubmit = async () => {
    if (!nicknameChecked) {
      Alert.alert('닉네임 중복 확인을 해주세요.');
      return;
    }
    try {
      await axios.patch(
        'http://localhost:8080/api/v1/users/nickname',
        {},
        {
          params: { nickName: nickname },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      Alert.alert('닉네임이 변경되었습니다.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        '닉네임 변경 실패',
        err.response?.data?.message || err.message,
      );
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="닉네임 변경" hideBackButton={false} />
      <View style={styles.container}>
        <Text style={styles.label}>기존 닉네임</Text>
        <Text style={styles.currentNickname}>{currentNickname}</Text>

        <Text style={styles.newLabel}>새 닉네임</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            value={nickname}
            onChangeText={text => {
              setNickname(text);
              setNicknameChecked(false);
            }}
            placeholder="닉네임 입력"
          />
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={checkNicknameDuplicate}
          >
            <Text style={styles.checkBtnText}>중복확인</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
          <Text style={styles.submitBtnText}>변경하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  currentNickname: {
    fontSize: 15,
    color: '#666',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  newLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  flexInput: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  checkBtn: {
    marginLeft: 10,
    backgroundColor: '#333',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  checkBtnText: { color: '#fff', fontWeight: 'bold' },
  submitBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
