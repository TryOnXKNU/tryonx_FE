import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Header from '../../components/Header';

// 'Pending' 상태 추가 (결제완료)
type OrderStatus =
  | ''
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'SHIPPING'
  | 'DELIVERED';

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

const ORDER_STATUSES: { label: string; value: OrderStatus }[] = [
  { label: '전체', value: '' },
  { label: '결제완료', value: 'PENDING' }, // 추가된 상태
  { label: '발송 처리', value: 'PROCESSING' },
  { label: '배송 준비', value: 'READY' },
  { label: '배송중', value: 'SHIPPING' },
  { label: '배송 완료', value: 'DELIVERED' },
];

export default function OrderManageScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('');
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/admin/orders',
        {
          headers: {
            Accept: '*/*',
            Authorization:
              'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJiaW4wNTI1MTJAZ21haWwuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzUzODEyNDk5LCJleHAiOjE3NTM5OTI0OTl9.-P9KKkOlG6ZjK0_e-lLu7nSVIOlHTLT8pk4arblCMnflXajUaMciM9Y-NDKdO2rVDISiKRFS6Kv3o8oQXZDblA',
          },
        },
      );
      const data: Order[] = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderNum}>{item.orderNum}</Text>
      <Text>{new Date(item.orderAt).toLocaleString()}</Text>
      <Text>상태: {item.orderStatus}</Text>
      {item.items.map(i => (
        <Text key={i.orderItemId} style={styles.productName}>
          {i.productName} x {i.quantity} ({i.price.toLocaleString()}원)
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="주문 관리" showRightIcons={false} hideBackButton={false} />
      <View style={styles.filterContainer}>
        {ORDER_STATUSES.map(status => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.statusButton,
              selectedStatus === status.value && styles.statusButtonActive,
            ]}
            onPress={() => setSelectedStatus(status.value)}
          >
            <Text
              style={[
                styles.statusButtonText,
                selectedStatus === status.value &&
                  styles.statusButtonTextActive,
              ]}
            >
              {status.label}
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
  container: { flex: 1, backgroundColor: '#fff' },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexWrap: 'wrap',
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
    backgroundColor: '#007bff',
  },
  statusButtonText: {
    color: '#333',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  searchInput: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 40,
  },
  orderItem: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  orderNum: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productName: {
    marginLeft: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  flatListContent: {
    paddingBottom: 100,
  },
});
