import React from 'react';
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

export default function MyPageScreen() {
  const navigation = useNavigation();

  const handleEditProfile = () => {
    Alert.alert('내정보 수정으로 이동');
  };

  const handleLogout = () => {
    Alert.alert('로그아웃 되었습니다.');
  };

  const handleWithdraw = () => {
    Alert.alert('회원탈퇴 처리되었습니다.');
  };

  // 실제 적립금, 주문내역, 리뷰 수치 (예시)
  const points = 1500;
  const orders = 2;
  const reviews = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://picsum.photos/50' }}
            style={styles.avatar}
          />
          <View style={styles.flex1}>
            <Text style={styles.nickname}>홍길동</Text>
            <Text style={styles.info}>175cm / 68kg</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editText}>내정보 수정</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.quickRow}>
          <QuickButton label="적립금" icon="wallet-outline" count={points} />
          <QuickButton label="주문내역" icon="cube-outline" count={orders} />
          <QuickButton
            label="리뷰"
            icon="chatbubble-ellipses-outline"
            count={reviews}
          />
        </View>

        {/* List Menu */}
        <View style={styles.menuList}>
          <MenuItem label="최근 본 상품" />
          <MenuItem label="주문내역" />
          <MenuItem label="문의내역" />
          <MenuItem label="리뷰내역" />
        </View>

        {/* Bottom Buttons 한 줄로 */}
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

// QuickButton Component, count 숫자 표시 추가
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

// MenuItem Component
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
