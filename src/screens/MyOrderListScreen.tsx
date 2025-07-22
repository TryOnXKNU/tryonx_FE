import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type OrderItem = {
  orderItemId: number;
  productName: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
  price: number;
  imageUrl: string;
};

type Order = {
  orderId: number;
  orderNum: string;
  orderItem: OrderItem[];
  totalPrice: number;
  orderItemsCount: number;
  orderedAt: string;
};

export default function MyOrderListScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { token } = useAuthStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const IMAGE_BASE_URL = 'http://localhost:8080';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8080/api/v1/order/my',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOrders(response.data);
      } catch (error) {
        console.error('주문내역 가져오기 실패:', error);
        Alert.alert('오류', '주문내역을 불러오지 못했습니다.');
      }
    };

    fetchOrders();
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleReorder = (_orderId: string) => {
    Alert.alert('재구매 기능은 준비 중입니다.');
  };

  const handleReview = (orderItemId: number) => {
    navigation.navigate('ReviewWrite', { orderItemId });
  };

  const handleReturnRequest = (orderId: number, orderItemId: number) => {
    navigation.navigate('ReturnRequest', { orderId, orderItemId });
  };

  const handleExchangeRequest = (orderId: number, orderItemId: number) => {
    navigation.navigate('ExchangeRequest', { orderId, orderItemId });
  };

  const handleDetail = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  const getImageUri = (imgUrl: string) => {
    if (!imgUrl) return '';
    return imgUrl.startsWith('http')
      ? imgUrl
      : IMAGE_BASE_URL + (imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl);
  };

  return (
    <View style={styles.container}>
      <Header title="주문내역" showRightIcons={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orders.length === 0 && (
          <Text style={styles.emptyText}>주문 내역이 없습니다.</Text>
        )}

        {orders
          .slice()
          .sort(
            (a, b) =>
              new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime(),
          )
          .map(order => {
            const firstItem = order.orderItem[0];
            return (
              <View key={order.orderId} style={styles.orderCard}>
                <Text style={styles.date}>{formatDate(order.orderedAt)}</Text>
                <Text style={styles.productName}>{order.orderNum}</Text>

                <View style={styles.productRow}>
                  <Image
                    source={{ uri: getImageUri(firstItem.imageUrl) }}
                    style={styles.productImg}
                  />

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {firstItem.productName}
                    </Text>
                    <Text style={styles.sizeQty}>
                      사이즈 {firstItem.size} / {firstItem.quantity}개
                      {order.orderItemsCount > 1
                        ? ` 외 ${order.orderItemsCount - 1}개`
                        : ''}
                    </Text>
                  </View>

                  <View style={styles.productNameRow}>
                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => handleDetail(order.orderId.toString())}
                    >
                      <Text style={styles.detailText}>상세보기</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reorderBtn]}
                    onPress={() => handleReorder(order.orderId.toString())}
                  >
                    <Text style={styles.reorderBtnText}>재구매</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reviewBtn]}
                    onPress={() => handleReview(firstItem.orderItemId)}
                  >
                    <Text style={styles.reviewBtnText}>리뷰작성</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.actionButtonsRow, styles.bottomButtonRow]}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reorderBtn]}
                    onPress={() =>
                      handleReturnRequest(order.orderId, firstItem.orderItemId)
                    }
                  >
                    <Text style={styles.reorderBtnText}>반품 신청</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reviewBtn]}
                    onPress={() =>
                      handleExchangeRequest(
                        order.orderId,
                        firstItem.orderItemId,
                      )
                    }
                  >
                    <Text style={styles.reviewBtnText}>교환 신청</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  orderCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginBottom: 12,
  },

  productNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailBtn: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailText: {
    color: '#000',
    fontWeight: '600',
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  productInfo: {
    flex: 1,
  },
  sizeQty: {
    color: '#666',
    fontSize: 14,
  },

  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reorderBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  reorderBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  reviewBtn: {
    backgroundColor: '#000',
    marginLeft: 8,
  },
  reviewBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomButtonRow: {
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
});
