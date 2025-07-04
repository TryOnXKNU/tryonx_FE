import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuthStore } from '../store/useAuthStore'; // zustand 상태
import axios from 'axios';
import { RootStackParamList } from '../navigation/types';

type MyPageNavigationProp = StackNavigationProp<RootStackParamList, 'MyPage'>;

export default function MyPageScreen() {
  const navigation = useNavigation<MyPageNavigationProp>();

  const { token, logout } = useAuthStore();
  const [userName, setUserName] = useState('');
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(68);

  const handleEditProfile = () => {
    Alert.alert('내정보 수정으로 이동');
  };

  const handleLogout = () => {
    logout();
    Alert.alert('로그아웃 되었습니다.');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleWithdraw = () => {
    Alert.alert('회원탈퇴 처리되었습니다.');
  };

  useEffect(() => {
    if (!token) {
      // 토큰 없으면 로그인 화면으로 강제 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/v1/users/list',
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.status === 200 && Array.isArray(response.data)) {
          const me = response.data[0];
          setUserName(me.name);
          setHeight(me.height);
          setWeight(me.weight);
        }
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    };

    fetchUserInfo();
  }, [token, navigation]);

  const points = 1500;
  const orders = 2;
  const reviews = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Icon name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.marginLeft16}>
            <Icon name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://picsum.photos/50' }}
            style={styles.avatar}
          />
          <View style={styles.flex1}>
            <Text style={styles.nickname}>{userName || '로딩 중...'}</Text>
            <Text style={styles.info}>
              {height}cm / {weight}kg
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editText}>내정보 수정</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          <QuickButton label="적립금" icon="wallet-outline" count={points} />
          <QuickButton label="주문내역" icon="cube-outline" count={orders} />
          <QuickButton
            label="리뷰"
            icon="chatbubble-ellipses-outline"
            count={reviews}
          />
        </View>

        <View style={styles.menuList}>
          <MenuItem label="최근 본 상품" />
          <MenuItem label="주문내역" />
          <MenuItem label="문의내역" />
          <MenuItem label="리뷰내역" />
        </View>

        <View style={styles.bottomActionsRow}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWithdraw}>
            <Text style={styles.withdrawText}>회원탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickButton({
  label,
  icon,
  count,
}: {
  label: string;
  icon: string;
  count?: number;
}) {
  return (
    <TouchableOpacity style={styles.quickButton}>
      <Icon name={icon} size={24} color="#000" />
      <Text style={styles.quickText}>{label}</Text>
      <Text style={styles.quickCount}>{count ?? 0}</Text>
    </TouchableOpacity>
  );
}

function MenuItem({ label }: { label: string }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Text style={styles.menuText}>{label}</Text>
      <Icon name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  nickname: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    paddingVertical: 20,
  },
  quickButton: {
    flex: 1,
    alignItems: 'center',
  },
  quickText: {
    marginTop: 8,
    fontWeight: '400',
  },
  quickCount: {
    fontSize: 14,
    fontWeight: '300',
    color: '#333',
    marginTop: 4,
  },
  menuList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    fontSize: 16,
  },
  bottomActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 16,
  },
  logoutText: {
    fontSize: 13,
    color: '#000',
    marginHorizontal: 10,
  },
  withdrawText: {
    fontSize: 13,
    color: '#d00',
    marginHorizontal: 10,
  },
  marginLeft16: {
    marginLeft: 16,
  },
  flex1: {
    flex: 1,
  },
});
