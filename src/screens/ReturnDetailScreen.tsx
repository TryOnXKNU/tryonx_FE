import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
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
  productName: string;
  productImageUrl: string;
};

export default function ReturnDetailScreen() {
  const { params } = useRoute<ReturnDetailRouteProp>();
  const { token } = useAuthStore();
  const [item, setItem] = useState<ReturnItem | null>(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = 'http://localhost:8080'; // Android: http://10.0.2.2:8080

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return { backgroundColor: '#FFE599', color: '#7A5901' };
      case 'ACCEPTED':
        return { backgroundColor: '#B6D7A8', color: '#274E13' };
      case 'REJECTED':
        return { backgroundColor: '#F4CCCC', color: '#990000' };
      case 'COLLECTING':
        return { backgroundColor: '#a4f4edff', color: '#086b69ff' };
      case 'COMPLETED':
        return { backgroundColor: '#a4c2f4', color: '#08306b' };
      default:
        return { backgroundColor: '#CCC', color: '#666' };
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/v1/return/${params.returnId}`,
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

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 상품 정보 카드 */}
        <View style={styles.card}>
          <Image
            source={{ uri: `${BASE_URL}${item.productImageUrl}` }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.priceText}>
            {item.price.toLocaleString()}원 / {item.quantity}개
          </Text>
          <Text
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusStyle(item.status).backgroundColor,
                color: getStatusStyle(item.status).color,
              },
            ]}
          >
            {item.status === 'REQUESTED'
              ? '요청 완료'
              : item.status === 'ACCEPTED'
              ? '접수 완료'
              : item.status === 'REJECTED'
              ? '반려'
              : item.status === 'COLLECTING'
              ? '상품 회수중'
              : item.status === 'COMPLETED'
              ? '교환 완료'
              : item.status}
          </Text>
        </View>

        {/* 반품 상세 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>반품 정보</Text>
          <Text style={styles.label}>주문 ID</Text>
          <Text style={styles.value}>{item.orderId}</Text>

          <Text style={styles.label}>주문 상품 ID</Text>
          <Text style={styles.value}>{item.orderItemId}</Text>

          <Text style={styles.label}>요청일</Text>
          <Text style={styles.value}>{formatDate(item.returnRequestedAt)}</Text>

          {item.returnApprovedAt && (
            <>
              <Text style={styles.label}>처리일</Text>
              <Text style={styles.value}>
                {formatDate(item.returnApprovedAt)}
              </Text>
            </>
          )}
        </View>

        {/* 요청 사유 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>요청 사유</Text>
          <Text style={styles.reason}>{item.reason}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  scroll: { padding: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#EEE',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  statusBadge: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: '#000',
    marginTop: 4,
  },
  reason: {
    fontSize: 15,
    color: '#444',
    marginTop: 4,
    lineHeight: 20,
  },
});
