import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ReturnRequest'>;

export default function ReturnRequestScreen({ route, navigation }: Props) {
  const { orderId, orderItemId } = route.params;
  const [reason, setReason] = useState('');
  const { token } = useAuthStore();

  const handleSubmit = async () => {
    try {
      await axios.post(
        'http://localhost:8080/api/v1/return',
        {
          orderId,
          orderItemId,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 토큰 헤더에 추가
          },
        },
      );
      Alert.alert('요청이 접수되었습니다.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '반품 요청에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="반품 신청" showRightIcons={false} hideBackButton={false} />

      <View style={styles.content}>
        <Text style={styles.label}>반품 사유</Text>
        <TextInput
          style={styles.input}
          multiline
          value={reason}
          onChangeText={setReason}
          placeholder="반품
           사유를 입력하세요"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>요청 제출</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 16 },
  label: { fontSize: 18, marginBottom: 12, fontWeight: '600', color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    height: 120,
    marginBottom: 24,
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  submitBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
