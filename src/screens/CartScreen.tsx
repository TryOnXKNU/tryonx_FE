import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';
import { Picker } from '@react-native-picker/picker';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; // RootStackParamList가 정의된 경로에 맞춰 import
import type { CartItem } from '../navigation/types';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

type CartResponse = {
  productPrice: number;
  deliveryFee: number;
  totalPrice: number;
  expectedPoint: number;
  items: CartItem[];
};

export default function CartScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { token } = useAuthStore();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productPrice, setProductPrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [expectedPoints, setExpectedPoints] = useState(0);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const allSelected =
    cartItems.length > 0 && selectedIds.length === cartItems.length;

  // 옵션 변경 모달
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [newSize, setNewSize] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);

  const API_URL = 'http://localhost:8080/api/v1/cart';

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('장바구니 정보를 가져오는데 실패했습니다.');
      }

      const data: CartResponse = await response.json();

      setCartItems(data.items);
      setDeliveryFee(data.deliveryFee);
      setExpectedPoints(data.expectedPoint);

      // 전체 선택 상태로 초기화
      const allIds = data.items.map(item => item.cartItemId);
      setSelectedIds(allIds);
    } catch (error) {
      Alert.alert('오류', (error as Error).message);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      Alert.alert('로그인이 필요합니다.', '로그인 후 이용해주세요.', [
        { text: '취소', style: 'cancel', onPress: () => navigation.goBack() },
        { text: '로그인', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    fetchCart(); // 장바구니 데이터 로드
  }, [fetchCart, navigation, token]);

  // 선택된 아이템 가격 합산 계산 useEffect 추가
  useEffect(() => {
    if (cartItems.length === 0) {
      setProductPrice(0);
      setTotalPayment(deliveryFee);
      return;
    }

    // 선택된 아이템 필터링
    const selectedItems = cartItems.filter(item =>
      selectedIds.includes(item.cartItemId),
    );

    // 선택된 아이템들의 가격 합산
    const sumPrice = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    setProductPrice(sumPrice);
    setTotalPayment(sumPrice + deliveryFee);
  }, [selectedIds, cartItems, deliveryFee]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.cartItemId));
    }
  };

  const updateCartItem = async (
    cartItemId: number,
    productId: number,
    quantity: number,
    size: string,
  ) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId,
          productId,
          quantity,
          size,
        }),
      });

      if (!response.ok) {
        throw new Error('옵션 변경에 실패했습니다.');
      }

      await fetchCart();
      Alert.alert('성공', '옵션이 변경되었습니다.');
    } catch (error) {
      Alert.alert('오류', (error as Error).message);
    }
  };

  const changeOption = (id: number) => {
    const item = cartItems.find(ci => ci.cartItemId === id);
    if (!item) return;

    setSelectedItem(item);
    setNewSize(item.size);
    setNewQuantity(item.quantity);
    setIsModalVisible(true);
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) {
      Alert.alert('알림', '삭제할 상품을 선택해주세요.');
      return;
    }

    Alert.alert(
      '삭제 확인',
      `${selectedIds.length}개의 상품을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                  selectedIds.map(id => ({ cartItemId: id })),
                ),
              });

              if (!response.ok) {
                throw new Error('상품 삭제에 실패했습니다.');
              }

              await fetchCart();
            } catch (error) {
              Alert.alert('오류', (error as Error).message);
            }
          },
        },
      ],
    );
  };

  const deleteItem = (id: number) => {
    Alert.alert('삭제 확인', `상품을 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify([{ cartItemId: id }]),
            });

            if (!response.ok) {
              throw new Error('상품 삭제에 실패했습니다.');
            }

            await fetchCart();
          } catch (error) {
            Alert.alert('오류', (error as Error).message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const isSelected = selectedIds.includes(item.cartItemId);
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity
          onPress={() => toggleSelect(item.cartItemId)}
          style={styles.checkbox}
        >
          {isSelected ? (
            <Icon name="checkbox" size={24} color="#000" />
          ) : (
            <Icon name="square-outline" size={24} color="#000" />
          )}
        </TouchableOpacity>

        <Image
          source={{ uri: `http://localhost:8080${item.imageUrl}` }}
          style={styles.productImage}
        />

        <View style={styles.infoContainer}>
          <TouchableOpacity
            onPress={() => deleteItem(item.cartItemId)}
            style={styles.itemDeleteIcon}
          >
            <Icon name="close" size={20} color="#555" />
          </TouchableOpacity>

          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.productSize}>
            {item.size} / {item.quantity} 개
          </Text>
          <Text style={styles.productPrice}>
            {(item.price * item.quantity).toLocaleString()}원
          </Text>

          <TouchableOpacity
            onPress={() => changeOption(item.cartItemId)}
            style={styles.optionButton}
          >
            <Text style={styles.optionButtonText}>옵션 변경</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="장바구니" hideBackButton={false} />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>옵션 변경</Text>

              {/* 사이즈 선택 */}
              <Text style={styles.label}>사이즈 선택</Text>
              <Picker
                selectedValue={newSize}
                onValueChange={(value: string) => setNewSize(value)}
                style={styles.picker}
              >
                {selectedItem?.availableSizes.map((size, index) => (
                  <Picker.Item key={index} label={size} value={size} />
                ))}
              </Picker>

              {/* 수량 변경 */}
              <Text style={styles.label}>수량 선택</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => setNewQuantity(q => Math.max(1, q - 1))}
                >
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{newQuantity}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => setNewQuantity(q => q + 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* 버튼 */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={async () => {
                    if (selectedItem) {
                      await updateCartItem(
                        selectedItem.cartItemId,
                        selectedItem.productId,
                        newQuantity,
                        newSize,
                      );
                      setIsModalVisible(false);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={toggleSelectAll} style={styles.checkboxRow}>
          {allSelected ? (
            <Icon name="checkbox" size={22} color="#000" />
          ) : (
            <Icon name="square-outline" size={22} color="#000" />
          )}
          <Text style={styles.marginLeft6}>전체 선택</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={deleteSelected} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={item => item.cartItemId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>장바구니가 비어있습니다.</Text>
          </View>
        }
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>상품 금액</Text>
          <Text style={styles.summaryText}>
            {productPrice.toLocaleString()}원
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>배송비</Text>
          <Text style={styles.summaryText}>
            {deliveryFee === 0 ? '무료' : deliveryFee.toLocaleString() + '원'}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, styles.totalLabel]}>
            총 결제금액
          </Text>
          <Text style={[styles.summaryText, styles.totalPrice]}>
            {totalPayment.toLocaleString()}원
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>예상 적립금</Text>
          <Text style={styles.summaryText}>{expectedPoints}P</Text>
        </View>

        <TouchableOpacity
          style={styles.paymentButton}
          onPress={() => {
            const selectedItemsData = cartItems.filter(item =>
              selectedIds.includes(item.cartItemId),
            );

            if (selectedItemsData.length === 0) {
              Alert.alert('알림', '주문할 상품을 선택해주세요.');
              return;
            }

            navigation.navigate('OrderSheet', {
              selectedItems: selectedItemsData,
              totalPayment,
              deliveryFee,
              expectedPoints,
            });
          }}
        >
          <Text style={styles.paymentButtonText}>
            {totalPayment.toLocaleString()}원 결제하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  marginLeft6: {
    marginLeft: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },

  checkbox: {
    marginRight: 10,
  },

  productImage: {
    width: 90,
    height: 110,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#eee',
  },

  infoContainer: {
    flex: 1,
  },

  productName: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
  },

  productSize: {
    color: '#333',
    marginTop: 4,
  },

  productQuantity: {
    color: '#333',
    marginTop: 2,
  },

  productPrice: {
    color: '#000',
    marginTop: 6,
    fontWeight: '700',
  },

  optionButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  optionButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },

  itemDeleteButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  itemDeleteButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },

  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },

  summaryText: {
    color: '#222',
    fontSize: 16,
  },

  totalLabel: {
    fontWeight: '700',
  },

  totalPrice: {
    fontWeight: '700',
    color: 'red',
  },

  paymentButton: {
    marginTop: 12,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  deleteButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  deleteButtonText: {
    color: '#333',
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#999',
    fontSize: 18,
  },

  itemDeleteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    padding: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  qtyButton: {
    backgroundColor: '#448aff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  qtyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  qtyText: {
    marginHorizontal: 20,
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#bbb',
  },
  confirmButton: {
    backgroundColor: '#448aff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
