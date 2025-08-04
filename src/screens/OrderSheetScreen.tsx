import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { RouteProp, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { RootStackParamList } from '../navigation/types';

type OrderSheetScreenRouteProp = RouteProp<RootStackParamList, 'OrderSheet'>;
type OrderSheetScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OrderSheet'
>;

type Props = {
  route: OrderSheetScreenRouteProp;
  navigation: OrderSheetScreenNavigationProp;
};

type OrderPreviewResponse = {
  memberInfo: {
    name: string;
    phone: string;
    address: string | null;
    availablePoint: number;
  };
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  expectedPoint: number;
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
    size: string;
    discountRate: string;
    imageUrl: string;
  }>;
};

export default function OrderSheetScreen({ route, navigation }: Props) {
  //const { productId, size, quantity } = route.params;
  //const { token } = useAuthStore();
  const token = useAuthStore(state => state.token);
  const isFocused = useIsFocused();

  // route.params가 두 가지 케이스 중 하나임을 체크
  const isDirectOrder =
    'productId' in route.params &&
    'size' in route.params &&
    'quantity' in route.params;

  // 바로구매용 파라미터
  const productId = isDirectOrder ? route.params.productId : undefined;
  const size = isDirectOrder ? route.params.size : undefined;
  const quantity = isDirectOrder ? route.params.quantity : undefined;

  // 장바구니용 파라미터
  const selectedItems = !isDirectOrder ? route.params.selectedItems : undefined;

  // const totalPayment = !isDirectOrder ? route.params.totalPayment : undefined;
  // const deliveryFee = !isDirectOrder ? route.params.deliveryFee : undefined;
  // const expectedPoints = !isDirectOrder
  //   ? route.params.expectedPoints
  //   : undefined;

  const [loading, setLoading] = useState(false);
  const [orderPreview, setOrderPreview] = useState<OrderPreviewResponse | null>(
    null,
  );
  const [usedPoint, setUsedPoint] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<
    'kakao' | 'card' | null
  >(null);

  //  배송 방법 선택

  const [requestOpen, setRequestOpen] = useState(false);
  const deliveryRequests = [
    '문 앞에 놓아 주세요',
    '부재 시 연락 부탁드립니다',
    '경비실에 맡겨 주세요',
    '직접 전달 부탁드립니다',
  ];
  const [selectedRequest, setSelectedRequest] = useState(deliveryRequests[0]);

  const [finalAmountAfterPoint, setFinalAmountAfterPoint] = useState<number>(0);

  useEffect(() => {
    if (!token) {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    if (!isFocused) return;

    const fetchOrderPreview = async () => {
      setLoading(true);
      try {
        let body;

        if (isDirectOrder) {
          // 바로구매
          body = {
            items: [{ productId, size, quantity }],
          };
        } else {
          // 장바구니 주문
          body = {
            items: selectedItems?.map(item => ({
              productId: item.productId,
              size: item.size,
              quantity: item.quantity,
            })),
          };
        }

        const response = await fetch(
          'http://localhost:8080/api/v1/order/preview',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('서버 응답 에러:', errorText);
          throw new Error('주문 미리보기 요청 실패');
        }

        const data: OrderPreviewResponse = await response.json();
        setOrderPreview(data);
        setFinalAmountAfterPoint(data.finalAmount); // 초기값
      } catch (error) {
        Alert.alert('오류', (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderPreview();
  }, [
    token,
    navigation,
    isFocused,
    isDirectOrder,
    productId,
    size,
    quantity,
    selectedItems,
  ]);

  useEffect(() => {
    if (!orderPreview) return;
    const point = parseInt(usedPoint || '0', 10);

    const newAmount = Math.max(orderPreview.finalAmount - point, 0);
    setFinalAmountAfterPoint(newAmount);
  }, [usedPoint, orderPreview]);

  const handleKakaoPay = () => {
    setSelectedPayment('kakao');
  };

  const handleCard = () => {
    setSelectedPayment('card');
  };

  if (loading || !orderPreview) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // 결제 버튼
  const handlePlaceOrder = async () => {
    if (!token) {
      Alert.alert('로그인이 필요합니다.');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    const pointsToUse = parseInt(usedPoint || '0', 10);
    if (pointsToUse > orderPreview?.memberInfo.availablePoint!) {
      Alert.alert('포인트가 부족합니다.');
      return;
    }
    if (pointsToUse > finalAmountAfterPoint) {
      Alert.alert('사용할 포인트가 결제 금액을 초과할 수 없습니다.');
      return;
    }
    if (!selectedPayment) {
      Alert.alert('결제 수단을 선택하세요.');
      return;
    }

    setLoading(true);
    try {
      let body;

      if (isDirectOrder) {
        body = {
          items: [{ productId, size, quantity }],
          point: pointsToUse,
          paymentMethod: selectedPayment,
          deliveryRequest: selectedRequest,
        };
      } else {
        body = {
          items: selectedItems?.map(item => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          })),
          point: pointsToUse,
          paymentMethod: selectedPayment,
          deliveryRequest: selectedRequest,
        };
      }

      const response = await fetch('http://localhost:8080/api/v1/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('주문 실패:', errorText);
        throw new Error('주문 처리에 실패했습니다.');
      }

      // 응답에서 orderId 받는다고 가정
      const responseData = await response.json();
      const orderId = responseData.orderId;

      Alert.alert('주문 성공', '주문이 정상적으로 처리되었습니다.', [
        {
          text: '확인',
          onPress: () =>
            navigation.replace('OrderComplete', {
              orderId,
              productId: isDirectOrder
                ? productId!
                : selectedItems?.[0].productId!,
            }),
        },
      ]);
    } catch (error) {
      Alert.alert('오류', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="주문서" showHomeButton={false} showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 배송지 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {orderPreview.memberInfo.name}
          </Text>
          <Text style={styles.text}>{orderPreview.memberInfo.address}</Text>
          <Text style={styles.text}>{orderPreview.memberInfo.phone}</Text>
          <Text style={[styles.sectionSubtitle]}>배송 요청사항</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setRequestOpen(prev => !prev)}
            >
              <Text style={styles.dropdownButtonText}>{selectedRequest}</Text>
              <Icon
                name={requestOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={24}
                color="#333"
              />
            </TouchableOpacity>

            {requestOpen && (
              <View style={styles.dropdownMenu}>
                {deliveryRequests.map(request => (
                  <TouchableOpacity
                    key={request}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedRequest(request);
                      setRequestOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedRequest === request && styles.selectedText,
                      ]}
                    >
                      {request}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 상품 정보 */}
        {orderPreview.items.map((item, idx) => (
          <View key={idx} style={styles.item}>
            <View style={styles.itemRow}>
              <Image
                source={{ uri: `http://localhost:8080${item.imageUrl}` }}
                style={styles.itemImage}
              />
              <View style={styles.itemtextCon}>
                <Text style={styles.text}>{item.productName}</Text>
                <Text style={styles.text}>
                  {item.size} / {item.quantity}개
                </Text>
                <Text style={styles.text}>{item.price.toLocaleString()}원</Text>
                <Text style={styles.text}>할인율: {item.discountRate}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* 포인트 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>포인트 사용</Text>
            <Text style={styles.text}>
              보유{' '}
              <Text style={styles.point}>
                {orderPreview.memberInfo.availablePoint.toLocaleString()}P
              </Text>
            </Text>
          </View>
          <TextInput
            placeholder="최소 5000P 이상 사용 가능"
            keyboardType="numeric"
            value={usedPoint}
            onChangeText={setUsedPoint}
            style={styles.input}
          />
        </View>

        {/* 결제 수단 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 수단</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                selectedPayment === 'kakao' && styles.selectedPaymentButton,
              ]}
              onPress={handleKakaoPay}
            >
              <Text
                style={[
                  styles.paymentButtonText,
                  selectedPayment === 'kakao' && styles.selectedText,
                ]}
              >
                카카오페이
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                selectedPayment === 'card' && styles.selectedPaymentButton,
              ]}
              onPress={handleCard}
            >
              <Text
                style={[
                  styles.paymentButtonText,
                  selectedPayment === 'card' && styles.selectedText,
                ]}
              >
                카드결제
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 결제 요약 */}
        {/* 결제 요약 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제 정보</Text>

          <View style={styles.row}>
            <Text style={styles.text}>상품 금액</Text>
            <Text style={styles.text}>
              {orderPreview.totalAmount.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>할인 금액</Text>
            <Text style={styles.text}>
              {orderPreview.discountAmount.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.text}>배송비</Text>
            <Text style={styles.text}>무료배송</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.textBold}>총 결제 금액</Text>
            <Text style={styles.textBold}>
              {finalAmountAfterPoint.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.textSub}>예상 적립금</Text>
            <Text style={[styles.textSub, styles.point]}>
              {orderPreview.expectedPoint.toLocaleString()}P
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
          <Text style={styles.buttonText}>
            {finalAmountAfterPoint.toLocaleString()}원 결제하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 140 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  sectionSubtitle: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  text: { fontSize: 16, color: '#333', marginBottom: 4 },
  textBold: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 8 },
  textSub: { fontSize: 14, color: '#555', marginTop: 4 },
  point: { fontWeight: '700', color: '#fca311' },

  dropdownWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginTop: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    fontWeight: '700',
    color: '#fff',
  },
  itemtextCon: {
    flex: 1,
    marginLeft: 12,
  },
  item: {
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  input: {
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedPaymentButton: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#fefefe',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    padding: 16,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});
