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

type Props = NativeStackScreenProps<RootStackParamList, 'EditAddress'>;

export default function EditAddressScreen({ navigation }: Props) {
  const { token } = useAuthStore();
  const [currentAddress, setCurrentAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentAddress(res.data.address || '-');
      } catch (error) {
        Alert.alert('주소 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchAddress();
  }, [token]);

  const onSubmit = async () => {
    if (!newAddress) {
      Alert.alert('새 주소를 입력해주세요.');
      return;
    }
    try {
      await axios.patch(
        'http://localhost:8080/api/v1/users/address',
        {},
        {
          params: { address: newAddress },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      Alert.alert('주소가 변경되었습니다.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('주소 변경 실패', err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="주소 변경" hideBackButton={false} />
      <View style={styles.container}>
        <Text style={styles.label}>기존 주소</Text>
        <Text style={styles.currentAddress}>{currentAddress}</Text>

        <Text style={styles.newLabel}>새 주소</Text>

        <TextInput
          style={styles.input}
          value={newAddress}
          onChangeText={setNewAddress}
          placeholder="새 주소 입력"
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
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  newLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  currentAddress: {
    fontSize: 15,
    color: '#666',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
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
