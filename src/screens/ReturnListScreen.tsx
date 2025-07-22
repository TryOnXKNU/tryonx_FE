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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return [
          styles.statusBadge,
          { backgroundColor: '#ffe599', color: '#7a5901' },
        ];
      case 'APPROVED':
        return [
          styles.statusBadge,
          { backgroundColor: '#b6d7a8', color: '#274e13' },
        ];
      case 'REJECTED':
        return [
          styles.statusBadge,
          { backgroundColor: '#f4cccc', color: '#990000' },
        ];
      default:
        return [styles.statusBadge, { backgroundColor: '#ccc' }];
    }
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
      <Header title="반품 내역" showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {returnList.length === 0 ? (
          <Text style={styles.emptyText}>반품 내역이 없습니다.</Text>
        ) : (
          returnList.map(item => (
            <View key={item.returnId} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.date}>
                  {formatDate(item.returnRequestedAt)}
                </Text>
                <Text style={getStatusStyle(item.status)}>
                  {getStatusText(item.status)}
                </Text>
              </View>
              <Text style={styles.label}>주문 정보</Text>
              <Text style={styles.text}>주문 ID: {item.orderId}</Text>
              <Text style={styles.text}>주문 상품 ID: {item.orderItemId}</Text>

              <Text style={styles.label}>상품 정보</Text>
              <Text style={styles.text}>수량: {item.quantity}개</Text>
              <Text style={styles.price}>
                금액: {item.price.toLocaleString()}원
              </Text>

              <Text style={styles.label}>사유</Text>
              <Text style={styles.reason}>{item.reason}</Text>

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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 13,
    color: '#777',
  },
  statusBadge: {
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#000',
  },
  reason: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },
  processedAt: {
    fontSize: 13,
    color: '#999',
    marginTop: 10,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 80,
    fontSize: 16,
    color: '#aaa',
  },
});
