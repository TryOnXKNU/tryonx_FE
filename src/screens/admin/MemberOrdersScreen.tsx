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
    return `${yy}${mm}${dd} ${hh}:${min}`;
  };

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

            {/* 테이블 헤더 */}
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.cellOrderId]}>
                주문번호/일시
              </Text>
              <Text style={[styles.cell, styles.cellProduct]}>상품명</Text>
              <Text style={[styles.cell, styles.cellPrice]}>금액</Text>
              <Text style={[styles.cell, styles.cellStatus]}>상태</Text>
            </View>
            <View style={styles.headerDivider} />
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            {/* 주문번호 + 주문일시 */}
            <View style={[styles.cell, styles.cellOrderId]}>
              <Text style={styles.orderId}>{item.orderId}</Text>
              <Text style={styles.orderDate}>{formatDate(item.orderedAt)}</Text>
            </View>

            {/* 상품명 */}
            <Text
              style={[styles.cell, styles.cellProduct]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.productName}
              {/* {`${item.productId} ${item.productName} (주문상품)`} */}
            </Text>

            {/* 금액 */}
            <Text style={[styles.cell, styles.cellPrice]}>
              {item.price.toLocaleString()}원
            </Text>

            {/* 상태 */}
            <Text style={[styles.cell, styles.cellStatus]}>
              {item.orderStatus}
            </Text>
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
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },

  // 테이블 관련 스타일
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 8,
    elevation: 1,
  },
  cell: {
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 4,
  },
  cellOrderId: {
    flex: 3,
  },
  cellProduct: {
    flex: 2,
  },
  cellPrice: {
    flex: 2,
    textAlign: 'center',
  },
  cellStatus: {
    flex: 2,
    textAlign: 'center',
  },

  orderId: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
