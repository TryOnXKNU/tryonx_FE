import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

type Member = {
  profileUrl: string | null;
  memberId: number;
  name: string;
};

const BASE_URL = 'http://localhost:8080';

export default function AllMembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const response = await axios.get<Member[]>(
          `${BASE_URL}/api/v1/admin/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setMembers(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('에러', '전체 회원 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllMembers();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Member }) => (
    <View style={styles.memberCard}>
      {item.profileUrl && item.profileUrl.trim() !== '' ? (
        <Image
          source={{ uri: `${BASE_URL}${item.profileUrl}` }}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.defaultProfile}>
          <Text style={styles.defaultProfileText}>{item.name.charAt(0)}</Text>
        </View>
      )}
      <View>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberId}>ID: {item.memberId}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="전체 회원" />
      <FlatList
        data={members}
        keyExtractor={item => item.memberId.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 회원이 없습니다.</Text>
        }
        contentContainerStyle={
          members.length === 0 ? styles.emptyContainer : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  defaultProfile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  defaultProfileText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  memberId: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
});
