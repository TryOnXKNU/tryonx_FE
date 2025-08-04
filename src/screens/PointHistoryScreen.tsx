import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';

type PointHistoryItem = {
  amount: number;
  description: string;
  createdAt: string;
};

export default function PointHistoryScreen() {
  const [history, setHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const SERVER_URL = 'http://localhost:8080';

  const fetchPointHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<PointHistoryItem[]>(
        `${SERVER_URL}/api/v1/points/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setHistory(res.data);
    } catch (error) {
      console.error('적립금 내역 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPointHistory();
  }, [fetchPointHistory]);

  //  날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(2); // 25
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 08
    const day = String(date.getDate()).padStart(2, '0'); // 05

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12 || 12; // 12시간제

    return `${year}.${month}.${day} ${ampm} ${hours}:${minutes}`;
  };

  const renderItem = ({ item }: { item: PointHistoryItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemText}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          item.amount > 0 ? styles.positiveAmount : styles.negativeAmount,
        ]}
      >
        {item.amount > 0 ? `+${item.amount}` : `${item.amount}`} P
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="적립금 내역" showRightIcons={false} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#D32F2F"
          style={styles.loading}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>적립금 내역이 없습니다.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { marginTop: 20 },
  listContent: { padding: 16 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: { flex: 1 },
  description: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  date: { fontSize: 12, color: '#666' },
  amount: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  positiveAmount: { color: '#2E7D32' },
  negativeAmount: { color: '#D32F2F' },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
