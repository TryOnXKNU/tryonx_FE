import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { AdminStackParamList } from '../../navigation/types'; // 경로는 실제 위치에 맞게 수정하세요.

export default function AdminHomeScreen() {
  const { logout } = useAuthStore();

  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        style: 'destructive',
        onPress: () => {
          logout();
          Alert.alert('로그아웃 되었습니다.');
        },
      },
    ]);
  };

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <Header isMain={true} showRightIcons={false} hideBackButton={true} />

      <View style={styles.content}>
        {/* 오늘 매출 */}
        <View style={styles.salesCard}>
          <Text style={styles.salesTitle}>오늘 매출</Text>
          <Text style={styles.salesDate}>{today}</Text>
          <Text style={styles.salesAmount}>₩ 1,250,000</Text>
        </View>

        {/* 회원 정보 */}
        <View style={styles.memberSection}>
          <TouchableOpacity style={styles.memberBox}>
            <Icon name="person-add" size={28} color="#D32F2F" />
            <Text style={styles.memberText}>신규회원</Text>
            <Text style={styles.memberCount}>12명</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.memberBox}>
            <Icon name="groups" size={28} color="#000" />
            <Text style={styles.memberText}>전체회원</Text>
            <Text style={styles.memberCount}>1,024명</Text>
          </TouchableOpacity>
        </View>

        {/* 접수 현황 */}
        <View style={styles.statusSection}>
          <TouchableOpacity
            style={styles.statusRow}
            onPress={() => navigation.navigate('OrderManage')}
          >
            <Text style={styles.statusLabel}>주문 접수</Text>
            <Text style={styles.statusValue}>24건</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statusRow}
            onPress={() => navigation.navigate('AdminExchangeList')}
          >
            <Text style={styles.statusLabel}>교환 접수</Text>
            <Text style={styles.statusValue}>3건</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statusRow}
            onPress={() => navigation.navigate('AdminReturnList')}
          >
            <Text style={styles.statusLabel}>반품 접수</Text>
            <Text style={styles.statusValue}>5건</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statusRow}
            onPress={() => navigation.navigate('InquiryManage')}
          >
            <Text style={styles.statusLabel}>문의 접수</Text>
            <Text style={styles.statusValue}>8건</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 로그아웃 버튼 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 20 },
  salesCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  salesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 5,
  },
  salesDate: { fontSize: 14, color: '#666', marginBottom: 10 },
  salesAmount: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  memberSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  memberBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  memberText: { fontSize: 14, color: '#555', marginTop: 5 },
  memberCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 3,
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusLabel: { fontSize: 16, color: '#333' },
  statusValue: { fontSize: 16, fontWeight: 'bold', color: '#D32F2F' },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
