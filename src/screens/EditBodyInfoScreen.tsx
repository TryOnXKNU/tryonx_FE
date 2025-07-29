import React, { useEffect, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'EditBodyInfo'>;
type BodyType = 1 | 2 | 3;

export default function EditBodyInfoScreen({ navigation }: Props) {
  const { token } = useAuthStore();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>(1);

  // 화면 로드 시 프로필 정보 받아오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        // 서버에서 받아온 값으로 상태 초기화
        if (data.height) setHeight(String(data.height));
        if (data.weight) setWeight(String(data.weight));
        if (data.bodyType) setBodyType(data.bodyType);
      } catch (err) {
        Alert.alert('프로필 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchUserProfile();
  }, [token]);

  const onSubmit = async () => {
    if (!height || !weight) {
      Alert.alert('키와 몸무게를 입력해주세요.');
      return;
    }
    try {
      await axios.patch(
        'http://localhost:8080/api/v1/users/bodyInfo',
        {
          height: Number(height),
          weight: Number(weight),
          bodyType,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert('체형 정보가 변경되었습니다.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('정보 변경 실패', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="체형 정보 변경" hideBackButton={false} />
      <View style={styles.container}>
        <Text style={styles.label}>키 (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="예: 175"
        />
        <Text style={styles.label}>몸무게 (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="예: 65"
        />
        <Text style={styles.label}>체형</Text>
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
  label: { fontWeight: 'bold', fontSize: 15, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionBtnSelected: { backgroundColor: '#000', borderColor: '#000' },
  optionText: { color: '#333' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
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
