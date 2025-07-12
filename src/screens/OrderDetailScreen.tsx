import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { RootStackParamList } from '../navigation/types';
import type { RouteProp } from '@react-navigation/native';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

type Props = {
  route: OrderDetailRouteProp;
};

type OrderItem = {
  productName: string;
  price: number;
  quantity: number;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  discountRate: string;
};

type MemberInfo = {
  name: string;
  phone: string;
  address: string | null;
  availablePoint: number;
};

type OrderDetail = {
  orderId: number;
  memberInfo: MemberInfo;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  usedPoints: number;
  items: OrderItem[];
  orderItemsCount: number;
  orderedAt: string;
};

export default function OrderDetailScreen({ route }: Props) {
  const { token } = useAuthStore();
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get<OrderDetail>(
          `http://localhost:8080/api/v1/order/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOrder(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('오류', '주문 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>주문 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const firstItem = order.items[0]; // 대표 상품

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const year = date.getFullYear() % 100;
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year.toString().padStart(2, '0')}.${month
      .toString()
      .padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      <Header title="주문 상세" showRightIcons={false} />
      <ScrollView
        style={styles.card}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 주문자 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{formatDate(order.orderedAt)}</Text>
          <Text style={styles.simpleInfo}>{orderId}</Text>
        </View>

        {/* 주문자 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주문자 정보</Text>

          <Text style={styles.simpleInfo}>{order.memberInfo.name}</Text>
          <Text style={styles.simpleInfo}>
            {order.memberInfo.address ?? '주소 없음'}
          </Text>
          <Text style={styles.simpleInfo}>{order.memberInfo.phone}</Text>
        </View>

        {/* 주문 상품 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            주문 상품 {order.orderItemsCount}개
          </Text>

          <Text style={styles.simpleInfo}>{order.status}</Text>

          <View style={styles.productRow}>
            {/* 왼쪽 이미지 */}
            <View style={styles.imageBox}>
              {/* 실제 이미지가 있다면 <Image source={{ uri: imageUrl }} style={styles.image} /> */}
              <View style={styles.imagePlaceholder}>
                <Text>이미지</Text>
              </View>
            </View>

            {/* 오른쪽 상품 정보 */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{firstItem.productName}</Text>
              <Text style={styles.productDetail}>
                {firstItem.size} / {firstItem.quantity}개
              </Text>
              <Text style={styles.productPrice}>
                {firstItem.price.toLocaleString()}원
              </Text>
            </View>
          </View>
        </View>

        {/* 결제 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>

          <View style={styles.row}>
            <Text style={styles.text}>상품 금액</Text>
            <Text style={styles.text}>
              {order.totalAmount.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>할인 금액</Text>
            <Text style={styles.text}>
              {order.discountAmount.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>포인트 사용</Text>
            <Text style={styles.text}>
              {order.usedPoints.toLocaleString()}원
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.textBold}>결제 금액</Text>
            <Text style={styles.textBold}>
              {order.finalAmount.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>결제 수단</Text>
            <Text style={styles.text}>카드</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  card: {
    margin: 16,
    padding: 10,
    backgroundColor: '#fff',
  },
  section: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  simpleInfo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    textAlign: 'left',
  },

  // 상품 정보
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  productDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  textBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#111',
  },
});
