import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';

type CartItem = {
  id: number;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  imgUrl: string;
};

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      productName: '멋진 셔츠',
      size: 'L',
      quantity: 2,
      price: 25000,
      imgUrl: 'https://via.placeholder.com/80',
    },
    {
      id: 2,
      productName: '편한 바지',
      size: 'M',
      quantity: 1,
      price: 40000,
      imgUrl: 'https://via.placeholder.com/80',
    },
  ]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const allSelected =
    cartItems.length > 0 && selectedIds.length === cartItems.length;

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item.id));
    }
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
          onPress: () => {
            setCartItems(prev =>
              prev.filter(item => !selectedIds.includes(item.id)),
            );
            setSelectedIds([]);
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
        onPress: () =>
          setCartItems(prev => prev.filter(item => item.id !== id)),
      },
    ]);
  };

  const changeOption = (id: number) => {
    Alert.alert('옵션 변경', `상품 ${id}의 옵션 변경 화면으로 이동`);
  };

  const totalProductPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const deliveryFee =
    totalProductPrice > 50000 || totalProductPrice === 0 ? 0 : 3000;

  const totalPayment = totalProductPrice + deliveryFee;

  const expectedPoints = Math.floor(totalPayment * 0.01);

  const renderItem = ({ item }: { item: CartItem }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <View style={styles.cartItem}>
        <TouchableOpacity
          onPress={() => toggleSelect(item.id)}
          style={styles.checkbox}
        >
          {isSelected ? (
            <Icon name="checkbox" size={24} color="#000" />
          ) : (
            <Icon name="square-outline" size={24} color="#000" />
          )}
        </TouchableOpacity>

        <Image source={{ uri: item.imgUrl }} style={styles.productImage} />

        <View style={styles.infoContainer}>
          {/* 삭제 아이콘 */}
          <TouchableOpacity
            onPress={() => deleteItem(item.id)}
            style={styles.itemDeleteIcon}
          >
            <Icon name="close" size={20} color="#555" />
          </TouchableOpacity>

          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.productSize}>
            {' '}
            {item.size} / {item.quantity} 개
          </Text>
          <Text style={styles.productPrice}>
            {(item.price * item.quantity).toLocaleString()}원
          </Text>

          <TouchableOpacity
            onPress={() => changeOption(item.id)}
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

      {/* 전체 선택 & 삭제 버튼 */}
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
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>장바구니가 비어있습니다.</Text>
          </View>
        }
      />

      {/* 결제 요약 */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>상품 금액</Text>
          <Text style={styles.summaryText}>
            {totalProductPrice.toLocaleString()}원
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
          onPress={() => Alert.alert('결제', '결제하기 버튼 클릭')}
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
});
