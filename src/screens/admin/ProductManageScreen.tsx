import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { AdminStackParamList } from '../../navigation/types';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

type ProductManageNavigationProp = StackNavigationProp<
  AdminStackParamList,
  'AdminTabs'
>;

type Product = {
  productId: number;
  productName: string;
  productCode: string;
  productPrice: number;
  discountRate: number;
  imageUrl: string | null;
  productItems: { size: string; stock: number; status: string }[];
};

const STATUS_OPTIONS = [
  { label: '판매중', value: 'AVAILABLE' },
  { label: '품절', value: 'SOLDOUT' },
  { label: '숨김', value: 'HIDDEN' },
];

export default function ProductManageScreen() {
  const navigation = useNavigation<ProductManageNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore(state => state.token);

  // 모달 관련 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editItems, setEditItems] = useState<
    { size: string; status: string }[]
  >([]);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:8080/api/v1/admin/product',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProducts(response.data);
    } catch (error) {
      console.error('상품 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts]),
  );

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditItems(
      product.productItems.map(item => ({
        size: item.size,
        status: item.status,
      })),
    );
    setModalVisible(true);
  };

  const handleStatusChange = (index: number, newStatus: string) => {
    const updated = [...editItems];
    updated[index].status = newStatus;
    setEditItems(updated);
  };

  const saveChanges = async () => {
    if (!selectedProduct || !token) return;
    try {
      await axios.patch(
        `http://localhost:8080/api/v1/admin/product/${selectedProduct.productId}`,
        { item: editItems },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert('성공', '상품 상태가 수정되었습니다.');
      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error('상품 수정 실패:', error);
      Alert.alert('실패', '상품 수정에 실패했습니다.');
    }
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate('AdminProductDetail', { productId: item.productId })
      }
    >
      <Image
        source={{
          uri: item.imageUrl
            ? `http://localhost:8080${item.imageUrl}`
            : 'https://via.placeholder.com/100',
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productPrice}>
          {item.productPrice.toLocaleString()}원{' '}
          {item.discountRate > 0 && (
            <Text style={styles.discount}>(-{item.discountRate}%)</Text>
          )}
        </Text>
        <Text style={styles.stockInfo}>
          재고: {item.productItems.reduce((acc, cur) => acc + cur.stock, 0)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => openEditModal(item)}
      >
        <Text style={styles.editBtnText}>수정</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="상품 관리" showRightIcons={false} hideBackButton={true} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="상품을 검색해보세요."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#000"
            style={styles.loadingIndicator}
          />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.productId.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('ProductAdd')}
      >
        <Text style={styles.addBtnText}>상품 등록</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>상품 상태 수정</Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
            >
              {editItems.map((item, index) => (
                <View style={styles.itemRow} key={`${item.size}-${index}`}>
                  <Text style={styles.itemSize}>{item.size}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={item.status}
                      style={styles.picker}
                      onValueChange={value => handleStatusChange(index, value)}
                    >
                      {STATUS_OPTIONS.map(option => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
                <Text style={styles.btnText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollView: {
    maxHeight: 300,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    marginBottom: 10,
  },
  searchInput: {
    height: 45,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#333',
  },
  discount: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  stockInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  addBtn: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#000',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  editBtn: {
    backgroundColor: '#007BFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemSize: {
    width: 80,
    fontSize: 16,
  },
  pickerContainer: {
    flex: 1, // flex-grow 1로 남은 공간 모두 차지
    marginLeft: 5,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    marginBottom: 3,
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 10,
  },
  cancelBtn: {
    backgroundColor: '#aaa',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  saveBtn: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
