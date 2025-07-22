// screens/ReturnDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { RootStackParamList } from '../navigation/types';

type ReturnDetailRouteProp = RouteProp<RootStackParamList, 'ReturnDetail'>;

type ReturnItem = {
  returnId: number;
  memberId: number;
  orderId: number;
  orderItemId: number;
  price: number;
  quantity: number;
  reason: string;
  status: string;
  returnRequestedAt: string;
  returnApprovedAt: string | null;
};

export default function ReturnDetailScreen() {
  const { params } = useRoute<ReturnDetailRouteProp>();
  const { token } = useAuthStore();
  const [item, setItem] = useState<ReturnItem | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/v1/return/${params.returnId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setItem(res.data);
      } catch (e) {
        Alert.alert('에러', '상세 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [params.returnId, token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#999" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>데이터를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="반품 상세" showRightIcons={false} />

      <View style={styles.content}>
        <Text style={styles.label}>주문 ID</Text>
        <Text style={styles.text}>{item.orderId}</Text>

        <Text style={styles.label}>주문 상품 ID</Text>
        <Text style={styles.text}>{item.orderItemId}</Text>

        <Text style={styles.label}>수량</Text>
        <Text style={styles.text}>{item.quantity}개</Text>

        <Text style={styles.label}>금액</Text>
        <Text style={styles.text}>{item.price.toLocaleString()}원</Text>

        <Text style={styles.label}>사유</Text>
        <Text style={styles.text}>{item.reason}</Text>

        <Text style={styles.label}>요청일</Text>
        <Text style={styles.text}>{formatDate(item.returnRequestedAt)}</Text>

        {item.returnApprovedAt && (
          <>
            <Text style={styles.label}>처리일</Text>
            <Text style={styles.text}>{formatDate(item.returnApprovedAt)}</Text>
          </>
        )}

        <Text style={styles.label}>상태</Text>
        <Text style={styles.text}>{item.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  errorText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
