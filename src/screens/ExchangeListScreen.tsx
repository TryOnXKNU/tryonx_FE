import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';

type Exchange = {
  exchangeId: number;
  memberId: number;
  orderId: number;
  orderItemId: number;
  price: number;
  quantity: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | string;
  requestedAt: string;
  processedAt: string | null;
};

export default function ExchangeListScreen() {
  const [exchangeList, setExchangeList] = useState<Exchange[]>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchExchangeList = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/v1/exchange/my',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setExchangeList(response.data);
      } catch (error) {
        console.error('교환 내역 가져오기 실패:', error);
        Alert.alert('오류', '교환 내역을 불러오지 못했습니다.');
      }
    };

    fetchExchangeList();
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return '요청 완료';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거절됨';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="교환 내역" showRightIcons={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {exchangeList.length === 0 ? (
          <Text style={styles.emptyText}>교환 내역이 없습니다.</Text>
        ) : (
          exchangeList.map(exchange => (
            <View key={exchange.exchangeId} style={styles.card}>
              <Text style={styles.date}>
                교환 요청일: {formatDate(exchange.requestedAt)}
              </Text>
              <Text style={styles.info}>
                주문 ID: {exchange.orderId} | 주문 상품 ID:{' '}
                {exchange.orderItemId}
              </Text>
              <Text style={styles.info}>수량: {exchange.quantity}</Text>
              <Text style={styles.info}>
                금액: {exchange.price.toLocaleString()}원
              </Text>
              <Text style={styles.reason}>사유: {exchange.reason}</Text>
              <Text
                style={[
                  styles.status,
                  exchange.status === 'REJECTED' && styles.statusRejected,
                ]}
              >
                상태: {getStatusText(exchange.status)}
              </Text>
              {exchange.processedAt && (
                <Text style={styles.date}>
                  처리일: {formatDate(exchange.processedAt)}
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
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  info: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  reason: {
    fontSize: 15,
    fontStyle: 'italic',
    marginBottom: 8,
    color: '#555',
  },
  status: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  statusRejected: {
    color: 'red',
  },
});
