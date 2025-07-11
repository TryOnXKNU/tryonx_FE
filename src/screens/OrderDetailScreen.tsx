import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
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

type OrderDetail = {
  orderId: string;
  productName: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
  price: number;
  imgUrl: string;
  orderItemsCount: number;
};

export default function OrderDetailScreen({ route }: Props) {
  const { token } = useAuthStore();
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const response = await axios.get<OrderDetail[]>(
          'http://localhost:8080/api/v1/order/my',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const found = response.data.find(o => o.orderId === orderId);
        if (found) {
          setOrder(found);
        } else {
          Alert.alert('오류', '주문 정보를 찾을 수 없습니다.');
        }
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

  return (
    <View style={styles.container}>
      <Header title="주문 상세" showRightIcons={false} />
      <ScrollView style={styles.card}>
        <Image source={{ uri: order.imgUrl }} style={styles.image} />
        <Text style={styles.name}>{order.productName}</Text>
        <Text style={styles.info}>사이즈: {order.size}</Text>
        <Text style={styles.info}>수량: {order.quantity}개</Text>
        <Text style={styles.info}>총 상품수: {order.orderItemsCount}개</Text>
        <Text style={styles.price}>가격: {order.price.toLocaleString()}원</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderColor: '#eee',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    marginVertical: 4,
    color: '#555',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    color: '#000',
  },
});
