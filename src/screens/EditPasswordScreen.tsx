import React, { useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'EditPassword'>;

export default function EditPasswordScreen({ navigation }: Props) {
  const { token } = useAuthStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const onSubmit = async () => {
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      Alert.alert('모든 필드를 입력해주세요.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      Alert.alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const checkRes = await axios.post(
        'http://localhost:8080/api/v1/users/check-password',
        { password: oldPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!checkRes.data) {
        Alert.alert('기존 비밀번호가 올바르지 않습니다.');
        return;
      }

      await axios.patch(
        'http://localhost:8080/api/v1/users/password',
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert('비밀번호가 변경되었습니다.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        '비밀번호 변경 실패',
        err.response?.data?.message || err.message,
      );
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="비밀번호 변경" hideBackButton={false} />
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="기존 비밀번호"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 확인"
          secureTextEntry
          value={newPasswordConfirm}
          onChangeText={setNewPasswordConfirm}
        />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
