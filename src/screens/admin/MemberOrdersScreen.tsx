import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

type Order = {
  profileUrl: string | null;
  name: string;
  memberId: number;
  orderId: number;
  orderedAt: string;
  productId: number;
  productName: string;
  price: number;
  orderStatus: string;
};

type MemberInfo = {
  profileUrl: string | null;
  name: string;
  memberId: number;
};

type Props = {
  route: { params: { memberId: number } };
};

const API_BASE = 'http://localhost:8080/api/v1/admin/members';

export default function MemberOrdersScreen({ route }: Props) {
  const { memberId } = route.params;
  const token = useAuthStore(state => state.token);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/${memberId}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then((ordersData: Order[]) => {
        setOrders(ordersData);

        if (ordersData.length > 0) {
          const { profileUrl, name, memberId } = ordersData[0];
          setMemberInfo({ profileUrl, name, memberId });
        }
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [memberId, token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yy}.${mm}.${dd} ${hh}:${min}`;
  };

  const STATUS_LABELS: Record<string, string> = {
    PENDING: '주문 완료',
    PROCESSING: '발송 처리',
    READY: '배송 준비',
    SHIPPING: '배송중',
    DELIVERED: '배송 완료',
  };

  const STATUS_COLORS: Record<string, string> = {
    PENDING: '#4b7bec',
    PROCESSING: '#3867d6',
    READY: '#f39c12',
    SHIPPING: '#20bf6b',
    DELIVERED: '#2ecc71',
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] || '#999';

  if (loading)
    return <ActivityIndicator style={styles.loadingIndicator} size="large" />;

  if (!orders.length)
    return <Text style={styles.noOrders}>주문 내역이 없습니다.</Text>;

  return (
    <View style={styles.screen}>
      <Header
        title="회원 주문 내역"
        showRightIcons={false}
        hideBackButton={false}
      />

      <FlatList
        data={orders}
        keyExtractor={(item, index) => `${item.orderId}-${index}`}
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <>
            {/* 회원 정보 섹션 */}
            {memberInfo && (
              <View style={styles.profileSection}>
                {memberInfo.profileUrl ? (
                  <Image
                    source={{
                      uri: `http://localhost:8080${memberInfo.profileUrl}`,
                    }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={[styles.profileImage, styles.noImage]}>
                    <Text style={styles.noImageText}>No Image</Text>
                  </View>
                )}
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{memberInfo.name}</Text>
                  <Text> {memberInfo.memberId}</Text>
                </View>
              </View>
            )}
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>주문 목록</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNum}>#{item.orderId}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.orderStatus) },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {STATUS_LABELS[item.orderStatus] || item.orderStatus}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{formatDate(item.orderedAt)}</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.productName}
              </Text>
              <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    padding: 16,
  },
  loadingIndicator: {
    flex: 1,
  },
  noOrders: {
    flex: 1,
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  noImage: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: { color: '#999' },
  profileInfo: {
    flex: 1,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  memberIdSub: { color: '#666', marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNum: { fontWeight: '800', fontSize: 14, color: '#111' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: { fontSize: 14, color: '#333', flex: 1, paddingRight: 8 },
  price: { fontSize: 14, color: '#111', fontWeight: '700' },
});
