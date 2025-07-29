import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Header from '../components/Header';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProfile'>;

export default function MyProfileScreen({ navigation }: Props) {
  const { token } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // fetchProfile을 useCallback으로 메모이제이션
  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (error) {
      Alert.alert('프로필 불러오기 실패');
    }
  }, [token]);

  //  화면이 포커스될 때마다 데이터 새로 불러오기
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  // Pull-to-Refresh 핸들러
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  if (!user) return <Text style={styles.loading}>로딩 중...</Text>;

  return (
    <View style={styles.safeArea}>
      <Header
        title="내정보 수정"
        showRightIcons={true}
        hideBackButton={false}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.profileCard}>
          {[
            { label: '닉네임', value: user.nickname },
            { label: '이메일', value: user.email },
            { label: '전화번호', value: user.phoneNumber },
            { label: '주소', value: user.address || '-' },
            {
              label: '체형',
              value: ['straight', 'natural', 'wave'][user.bodyType - 1],
            },
            { label: '키', value: `${user.height} cm` },
            { label: '몸무게', value: `${user.weight} kg` },
          ].map((item, index) => (
            <View key={index} style={styles.infoColumn}>
              <Text style={styles.labelText}>{item.label}</Text>
              <Text style={styles.valueText}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* 버튼 리스트 */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('EditNickname')}
        >
          <Text style={styles.btnText}>닉네임 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('EditAddress')}
        >
          <Text style={styles.btnText}>주소 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('EditPassword')}
        >
          <Text style={styles.btnText}>비밀번호 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('EditBodyInfo')}
        >
          <Text style={styles.btnText}>체형/키/몸무게 변경</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  labelText: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    lineHeight: 22,
  },
  infoColumn: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
