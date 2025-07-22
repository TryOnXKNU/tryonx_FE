import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';

type ReturnItem = {
  returnId: number;
  memberId: number;
  orderId: number;
  orderItemId: number;
  price: number;
  quantity: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | string;
  returnRequestedAt: string;
  returnApprovedAt: string | null;
};

export default function ReturnListScreen() {
  const [returnList, setReturnList] = useState<ReturnItem[]>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchReturnList = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/v1/return/my',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setReturnList(response.data);
      } catch (error) {
        console.error('반품 내역 가져오기 실패:', error);
        Alert.alert('오류', '반품 내역을 불러오지 못했습니다.');
      }
    };

    fetchReturnList();
  }, [token]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return '#FFD700'; // gold
      case 'APPROVED':
        return '#4CAF50'; // green
      case 'REJECTED':
        return '#FF5252'; // red
      default:
        return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="반품 내역" showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {returnList.length === 0 ? (
          <Text style={styles.emptyText}>반품 내역이 없습니다.</Text>
        ) : (
          returnList.map(item => (
            <View key={item.returnId} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.date}>
                  {formatDate(item.returnRequestedAt)}
                </Text>
                <Text
                  style={[
                    styles.status,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              <Text style={styles.info}>주문 ID: {item.orderId}</Text>
              <Text style={styles.info}>상품 ID: {item.orderItemId}</Text>
              <Text style={styles.info}>수량: {item.quantity}</Text>
              <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
              <Text style={styles.reason}>사유: {item.reason}</Text>
              {item.returnApprovedAt && (
                <Text style={styles.processedAt}>
                  처리일: {formatDate(item.returnApprovedAt)}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: '#333',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: '#aaa',
  },
  status: {
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  info: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginVertical: 4,
  },
  reason: {
    fontSize: 13,
    color: '#bbb',
    fontStyle: 'italic',
    marginTop: 6,
  },
  processedAt: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 80,
    fontSize: 16,
    color: '#777',
  },
});
