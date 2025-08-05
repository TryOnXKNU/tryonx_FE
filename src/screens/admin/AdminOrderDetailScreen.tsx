import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';
import { RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
  AdminOrderDetail: { orderId: number | string };
};

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'AdminOrderDetail'>;

type OrderStatus =
  | ''
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPING'
  | 'DELIVERED';

// 상태 라벨 매핑
const STATUS_LABELS: Record<OrderStatus, string> = {
  '': '전체',
  PENDING: '주문 완료',
  PROCESSING: '발송 처리',
  READY: '배송 준비',
  SHIPPING: '배송중',
  DELIVERED: '배송 완료',
};

// 상태별 색상
const STATUS_COLORS: Record<OrderStatus, string> = {
  '': '#00000000', // 투명색 또는 기본값
  PENDING: '#ef2c00ff',
  PROCESSING: '#f39c12', // 주황색
  READY: '#2980b9', // 파랑색
  SHIPPING: '#27ae60', // 초록색
  DELIVERED: '#8e44ad', // 보라색
};

type OrderItem = {
  orderItemId: number;
  productName: string;
  imageUrl: string;
  size: string;
  quantity: number;
  price: number | null;
};

type OrderDetail = {
  orderId: number;
  orderStatus: OrderStatus;
  orderAt: string;
  orderNum: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  totalPrice: number | null;
  discountAmount: number | null;
  usedPoints: number | null;
  deliveryFee: string | null;
  finalAmount: number | null;
  discountRate: number | null;
  paymentMethod: string;
  items: OrderItem[];
};

const formatPrice = (value: number | null | undefined) =>
  value != null ? value.toLocaleString() : '0';

export default function AdminOrderDetailScreen() {
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;
  const { token } = useAuthStore();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/admin/orders/${orderId}`,
          {
            headers: {
              Accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) throw new Error('Failed to fetch order detail');
        const data: OrderDetail = await response.json();
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrderDetail();
  }, [orderId, token]);

  if (loading) {
    return <Text style={styles.loading}>로딩중...</Text>;
  }

  if (!order) {
    return <Text style={styles.error}>주문 정보를 불러올 수 없습니다.</Text>;
  }

  return (
    <View style={styles.container}>
      <Header title="주문 상세" showRightIcons={false} hideBackButton={false} />
      <ScrollView style={styles.content}>
        {/* 주문 기본 정보 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>주문 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>주문번호</Text>
            <Text style={styles.value}>{order.orderNum}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>주문일시</Text>
            <Text style={styles.value}>
              {new Date(order.orderAt).toLocaleString('ko-KR', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>상태</Text>
            <Text
              style={[
                styles.value,
                { color: STATUS_COLORS[order.orderStatus] || '#000' },
                styles.status,
              ]}
            >
              {STATUS_LABELS[order.orderStatus] || order.orderStatus}
            </Text>
          </View>
        </View>

        {/* 고객 정보 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>고객 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>이름</Text>
            <Text style={styles.value}>{order.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>연락처</Text>
            <Text style={styles.value}>{order.phoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>이메일</Text>
            <Text style={styles.value}>{order.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>주소</Text>
            <Text style={styles.value}>{order.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>결제방법</Text>
            <Text style={styles.value}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* 상품 목록 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>상품 목록</Text>
          {order.items.map(item => (
            <View key={item.orderItemId} style={styles.itemContainer}>
              <Image
                source={{ uri: `http://localhost:8080${item.imageUrl}` }}
                style={styles.image}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.itemDetail}>사이즈: {item.size}</Text>
                <Text style={styles.itemDetail}>수량: {item.quantity}</Text>
                <Text style={styles.price}>₩ {formatPrice(item.price)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 금액 정보 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>결제 금액</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>상품금액</Text>
            <Text style={styles.value}>₩ {formatPrice(order.totalPrice)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>할인</Text>
            <Text style={[styles.value, styles.discount]}>
              - ₩ {formatPrice(order.discountAmount)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>배송비</Text>
            <Text style={styles.value}>{order.deliveryFee || '0원'}</Text>
          </View>
          <View style={[styles.infoRow, styles.finalAmountRow]}>
            <Text style={styles.finalLabel}>최종결제</Text>
            <Text style={styles.finalAmount}>
              ₩ {formatPrice(order.finalAmount)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 16 },
  loading: { textAlign: 'center', marginTop: 50 },
  error: { textAlign: 'center', marginTop: 50, color: 'red' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: { fontSize: 14, color: '#666' },
  value: { fontSize: 14, color: '#333' },
  status: { fontWeight: 'bold' },
  discount: { color: '#e53935' },

  finalAmountRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  finalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  finalAmount: { fontSize: 16, fontWeight: 'bold', color: '#000' },

  itemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  itemDetail: { fontSize: 13, color: '#666', marginBottom: 2 },
  price: { fontSize: 14, fontWeight: 'bold', color: '#000' },
});
