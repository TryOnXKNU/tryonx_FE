import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';

type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPING'
  | 'DELIVERED'
  | '';

type OrderItem = {
  orderItemId: number;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  orderId: number | string;
  orderNum: string;
  orderAt: string;
  orderStatus: OrderStatus;
  items: OrderItem[];
};

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
  '': '#00000000',
  PENDING: '#ef2c00ff',
  PROCESSING: '#f39c12',
  READY: '#2980b9',
  SHIPPING: '#27ae60',
  DELIVERED: '#8e44ad',
};

//  날짜 포맷 함수 (예: 25.07.25)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export default function OrderManageScreen() {
  const { token } = useAuthStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('');
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  //  주문 데이터 가져오기
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/admin/orders',
        {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data: Order[] = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 필터링 로직
  useEffect(() => {
    let filtered = [...orders];

    if (selectedStatus) {
      filtered = filtered.filter(order => order.orderStatus === selectedStatus);
    }

    if (searchText.trim()) {
      const text = searchText.trim().toLowerCase();
      filtered = filtered.filter(order => {
        const orderNumMatch = order.orderNum.toLowerCase().includes(text);
        const itemMatch = order.items.some(item =>
          item.productName.toLowerCase().includes(text),
        );
        return orderNumMatch || itemMatch;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchText]);

  // 주문 카드 렌더링
  const renderOrder = ({ item }: { item: Order }) => {
    const statusColor = STATUS_COLORS[item.orderStatus] || '#666';
    const productPreview = item.items
      .slice(0, 2)
      .map(i => `${i.productName} x${i.quantity}`)
      .join(', ');
    const extraCount =
      item.items.length > 2 ? ` +${item.items.length - 2}개` : '';
    const totalPrice = item.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('AdminOrderDetail', { orderId: item.orderId })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderNum}>{item.orderNum}</Text>
          <Text style={[styles.orderStatus, { color: statusColor }]}>
            {STATUS_LABELS[item.orderStatus]}
          </Text>
        </View>
        <Text style={styles.orderDate}>{formatDate(item.orderAt)}</Text>
        <Text style={styles.productPreview}>{productPreview + extraCount}</Text>
        <Text style={styles.totalPrice}>
          총 금액: ₩{totalPrice.toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="주문 관리" showRightIcons={false} hideBackButton={true} />
      <View style={styles.filterContainer}>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.statusButton,
              selectedStatus === key && styles.statusButtonActive,
            ]}
            onPress={() => setSelectedStatus(key as OrderStatus)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === key && styles.statusButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="주문번호 또는 상품명 검색"
        value={searchText}
        onChangeText={setSearchText}
      />

      {loading ? (
        <Text style={styles.loadingText}>로딩중...</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.orderId.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>주문이 없습니다.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: '#000',
  },
  statusButtonText: {
    color: '#333',
    fontSize: 14,
  },
  statusButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchInput: {
    margin: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    backgroundColor: '#fff',
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderNum: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  orderStatus: {
    fontWeight: '600',
    fontSize: 14,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  productPreview: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  flatListContent: {
    paddingBottom: 100,
  },
});
