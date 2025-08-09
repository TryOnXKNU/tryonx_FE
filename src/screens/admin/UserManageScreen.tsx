import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import axios from 'axios';
import { useAuthStore } from '../..//store/useAuthStore';
import { useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';

const SERVER_URL = 'http://localhost:8080'; // 서버 주소

type Member = {
  profileUrl: string;
  memberId: number;
  name: string;
  email?: string;
  phone?: string;
};

// 단일 검색창으로 회원명/회원번호 동시 검색

const ProfileImage = ({ uri }: { uri: string }) => {
  if (uri) {
    return (
      <Image
        source={{ uri: `${SERVER_URL}${uri}` }}
        style={styles.profileImage}
      />
    );
  }
  return <View style={[styles.profileImage, styles.placeholder]} />;
};

export default function UserManageScreen() {
  const token = useAuthStore(state => state.token);
  type AdminNavigationProp = NativeStackNavigationProp<AdminStackParamList>;
  const navigation = useNavigation<AdminNavigationProp>();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<Member[]>(
        `${SERVER_URL}/api/v1/admin/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMembers(res.data);
    } catch (error) {
      Alert.alert('오류', '회원 목록을 불러오는데 실패했습니다.');
      console.error(error);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const filteredMembers = members.filter(member => {
    if (!searchText.trim()) return true;
    const text = searchText.trim().toLowerCase();
    const nameMatch = (member.name || '').toLowerCase().includes(text);
    const idMatch = String(member.memberId || '').includes(text);
    return nameMatch || idMatch;
  });

  const handleDelete = (memberId: number) => {
    Alert.alert('삭제 확인', '정말 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(
              `${SERVER_URL}/api/v1/admin/member/${memberId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            Alert.alert('삭제 완료', '회원이 삭제되었습니다.');
            fetchMembers();
          } catch (error) {
            Alert.alert('오류', '삭제에 실패했습니다.');
            console.error(error);
          }
        },
      },
    ]);
  };

  const goToDetail = (member: Member) => {
    navigation.navigate('MemberDetail', { memberId: member.memberId });
  };

  const goToOrders = (memberId: number) => {
    navigation.navigate('MemberOrders', { memberId });
  };

  const renderItem = ({ item }: { item: Member }) => (
    <View style={styles.memberItem}>
      <ProfileImage uri={item.profileUrl} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberText}>
          {item.memberId} {item.name}
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <View style={styles.deleteBtnContainer}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.memberId)}
          >
            <Text style={styles.deleteBtnText}>삭제</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.detailBtnsRow}>
          <TouchableOpacity
            style={[styles.detailBtn, styles.detailBtnMargin]}
            onPress={() => goToDetail(item)}
          >
            <Text style={styles.detailBtnText}>상세정보</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => goToOrders(item.memberId)}
          >
            <Text style={styles.detailBtnText}>주문내역</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // placeholder는 고정 문구 사용

  return (
    <View style={styles.container}>
      <Header title="회원 관리" showRightIcons={false} hideBackButton={true} />

      {/* 상단 툴바: 통합 검색 (회원명/회원번호) */}
      <View style={styles.toolbar}>
        <TextInput
          style={styles.searchInput}
          placeholder="회원명 또는 회원번호를 입력하세요"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#000"
          style={styles.loadingIndicator}
        />
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={item => item.memberId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  toolbar: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  // 단일 검색창만 사용. 칩/필터 행 제거
  searchInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: '#fafafa',
  },

  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    minHeight: 88,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  placeholder: {
    backgroundColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#222',
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 88,
  },
  deleteBtnContainer: {
    marginBottom: 8,
  },
  deleteBtn: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  detailBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailBtnMargin: {
    marginRight: 8,
  },

  detailBtnText: {
    color: '#000',
    fontWeight: '500',
    fontSize: 13,
  },

  loadingIndicator: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
});
