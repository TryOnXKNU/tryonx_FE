import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuthStore } from '../store/useAuthStore'; // zustand 상태
import axios from 'axios';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';

type MyPageNavigationProp = StackNavigationProp<RootStackParamList, 'MyPage'>;

export default function MyPageScreen() {
  const navigation = useNavigation<MyPageNavigationProp>();

  const isFocused = useIsFocused(); // 포커스 상태 감지

  const { token, logout } = useAuthStore();
  const [userName, setUserName] = useState('');
  const [height, setHeight] = useState();
  const [weight, setWeight] = useState();
  const [point, setPoint] = useState();

  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 주문 내역 숫자 상태
  const [orders, setOrders] = useState<number | undefined>();

  // 리뷰 내역 숫자 상태
  const [reviews, setReviews] = useState<number | undefined>();

  const handleEditProfile = () => {
    navigation.navigate('MyProfile');
  };

  const handleEditProfileImage = () => {
    navigation.navigate('EditProfileImage');
  };

  const handleLogout = () => {
    logout();
    Alert.alert('로그아웃 되었습니다.');
  };

  const SERVER_URL = 'http://localhost:8080';

  // 탈퇴
  const handleWithdraw = async () => {
    Alert.alert(
      '회원탈퇴',
      '정말로 탈퇴하시겠습니까? 탈퇴 후 계정은 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${SERVER_URL}/api/v1/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Alert.alert('탈퇴 완료', '회원탈퇴가 완료되었습니다.');
              logout(); //  여기서 상태를 바꾸면 AppNavigator가 AuthStack으로 전환됨
            } catch (error) {
              console.error('회원탈퇴 오류:', error);
              Alert.alert('오류', '회원탈퇴 중 문제가 발생했습니다.');
            }
          },
        },
      ],
    );
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

    if (!isFocused) return;

    const fetchUserInfo = async () => {
      try {
        const userRes = await axios.get(`${SERVER_URL}/api/v1/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.status === 200) {
          const me = userRes.data;
          setUserName(me.nickname);
          setHeight(me.height);
          setWeight(me.weight);
          setPoint(me.point);
        }

        const profileRes = await axios.get(
          `${SERVER_URL}/api/v1/users/profile-image`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (profileRes.status === 200 && profileRes.data) {
          // profileRes.data가 "/upload/profile/xxx.jpg" 형태
          setProfileImage(`${SERVER_URL}${profileRes.data}`);
        }
      } catch (error) {
        console.error('유저 정보 가져오기 실패:', error);
      }
    };

    const fetchOrderCount = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/v1/order/my/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          setOrders(res.data); // 숫자 응답
        }
      } catch (error) {
        console.error('주문 개수 가져오기 실패:', error);
      }
    };

    const fetchReviewCount = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/v1/reviews/my/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          setReviews(res.data); // ← 리뷰 개수는 reviews에 저장!
        }
      } catch (error) {
        console.error('리뷰 개수 가져오기 실패:', error);
      }
    };

    fetchUserInfo();
    fetchOrderCount();
    fetchReviewCount();
  }, [token, navigation, isFocused]);

  return (
    <View style={styles.safeArea}>
      <Header title="마이페이지" showRightIcons={true} hideBackButton={true} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleEditProfileImage}>
            <Image
              source={
                profileImage
                  ? { uri: encodeURI(profileImage) }
                  : require('../assets/images/logo.png')
              }
              style={styles.avatar}
            />
          </TouchableOpacity>

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
          <QuickButton
            label="적립금"
            icon="wallet-outline"
            count={point}
            onPress={() => navigation.navigate('PointHistory')}
          />

          <QuickButton
            label="주문"
            icon="cube-outline"
            count={orders}
            onPress={() => navigation.navigate('MyOrderList')}
          />
          <QuickButton
            label="리뷰"
            icon="chatbubble-ellipses-outline"
            count={reviews}
            onPress={() => navigation.navigate('MyReviewList')}
          />
        </View>

        <View style={styles.menuList}>
          <MenuItem
            label="최근 본 상품"
            onPress={() => navigation.navigate('RecentItem')}
          />

          {/* <MenuItem
            label="주문내역"
            onPress={() => navigation.navigate('MyOrderList')}
          /> */}

          <MenuItem
            label="문의내역"
            onPress={() => navigation.navigate('Inquiry')}
          />
          {/* 
          <MenuItem
            label="리뷰내역"
            onPress={() => navigation.navigate('MyReviewList')}
          /> */}

          <MenuItem
            label="교환 내역"
            onPress={() => navigation.navigate('ExchangeList')}
          />

          <MenuItem
            label="반품 내역"
            onPress={() => navigation.navigate('ReturnList')}
          />
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
    </View>
  );
}

function QuickButton({
  label,
  icon,
  count,
  onPress,
}: {
  label: string;
  icon: string;
  count?: number;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickButton} onPress={onPress}>
      <Icon name={icon} size={24} color="#000" />
      <Text style={styles.quickText}>{label}</Text>
      <Text style={styles.quickCount}>{count ?? 0}</Text>
    </TouchableOpacity>
  );
}

function MenuItem({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void; // 선택적 추가
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
    backgroundColor: '#ccc',
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
