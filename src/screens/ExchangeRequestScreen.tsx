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

type Props = NativeStackScreenProps<RootStackParamList, 'ExchangeRequest'>;

export default function ExchangeRequestScreen({ route }: Props) {
  const { orderId, orderItemId } = route.params;
  const [reason, setReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // 신청 상태
  const { token } = useAuthStore();

  const handleSubmit = async () => {
    if (isSubmitted) return; // 이미 신청됐으면 무시

    try {
      await axios.post(
        'http://localhost:8080/api/v1/exchange',
        {
          orderId,
          orderItemId,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      Alert.alert('요청이 접수되었습니다.');
      setIsSubmitted(true); // 신청 완료 처리
      // navigation.goBack();  // 선택사항: 바로 뒤로가기 하지 않고 버튼 비활성화 상태 유지 가능
    } catch (error) {
      Alert.alert('오류', '교환 요청에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="교환 신청" showRightIcons={false} hideBackButton={false} />

      <View style={styles.content}>
        <Text style={styles.label}>교환 사유</Text>
        <TextInput
          style={[styles.input, isSubmitted && styles.inputDisabled]}
          multiline
          value={reason}
          onChangeText={setReason}
          placeholder="교환 사유를 입력하세요"
          placeholderTextColor="#999"
          editable={!isSubmitted} // 제출 후 입력 비활성화
        />

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitted && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitted} // 제출 후 버튼 비활성화
        >
          <Text style={styles.submitBtnText}>
            {isSubmitted ? '신청 완료' : '요청 제출'}
          </Text>
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
  inputDisabled: {
    backgroundColor: '#eee',
    color: '#888',
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
  submitBtnDisabled: {
    backgroundColor: '#555',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
