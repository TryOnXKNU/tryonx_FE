import { useFocusEffect } from '@react-navigation/native';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
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

export default function ProductManageScreen() {
  const navigation = useNavigation<ProductManageNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore(state => state.token);

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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="상품 관리" showRightIcons={false} hideBackButton={true} />

      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="상품을 검색해보세요."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/*  상품 목록 */}
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

      {/*  하단 고정 버튼 */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('ProductAdd')}
      >
        <Text style={styles.addBtnText}>상품 등록</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
});
