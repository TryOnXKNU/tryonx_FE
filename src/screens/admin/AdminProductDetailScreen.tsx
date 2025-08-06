import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {
  RouteProp,
  useRoute,
  useNavigation,
  CommonActions,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';
import Header from '../../components/Header';

type ProductDetailRouteProp = RouteProp<
  AdminStackParamList,
  'AdminProductDetail'
>;

type NavigationProp = NativeStackNavigationProp<
  AdminStackParamList,
  'AdminProductDetail'
>;

type ProductDetail = {
  productId: number;
  productName: string;
  productPrice: number;
  description: string;
  productImages: string[];
  productItems: {
    size: string;
    stock: number;
    status: string;
  }[];
};

// 상태 옵션 한글 매핑
const STATUS_OPTIONS = [
  { label: '판매중', value: 'AVAILABLE' },
  { label: '품절', value: 'SOLDOUT' },
  { label: '숨김', value: 'HIDDEN' },
];

export default function ProductDetailScreen() {
  const { params } = useRoute<ProductDetailRouteProp>();
  const { productId } = params;
  const navigation = useNavigation<NavigationProp>();
  const token = useAuthStore(state => state.token);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProductDetail = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/v1/admin/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProduct(response.data);
    } catch (error) {
      console.error('상품 상세 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [token, productId]);

  useFocusEffect(
    useCallback(() => {
      fetchProductDetail(); // 화면이 포커스될 때마다 데이터 새로 불러옴
    }, [fetchProductDetail]),
  );

  const handleDelete = async () => {
    if (!token) {
      Alert.alert('오류', '로그인 정보가 없습니다.');
      return;
    }

    Alert.alert('삭제 확인', '정말 이 상품을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(
              `http://localhost:8080/api/v1/admin/product/${productId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            Alert.alert('성공', '상품이 삭제되었습니다.', [
              {
                text: '확인',
                onPress: () =>
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'ProductManage' }],
                    }),
                  ),
              },
            ]);
          } catch (error: any) {
            console.error('삭제 실패:', error.response?.data || error.message);
            Alert.alert('실패', '상품 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>상품 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="상품 상세" showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 이미지 */}
        <ScrollView horizontal pagingEnabled>
          {product.productImages.map((img, index) => (
            <Image
              key={index}
              source={{ uri: `http://localhost:8080${img}` }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        {/* 상품명 */}
        <Text style={styles.name}>{product.productName}</Text>

        {/* 가격 */}
        <Text style={styles.price}>
          {product.productPrice.toLocaleString()}원
        </Text>

        {/* 설명 */}
        <Text style={styles.description}>{product.description}</Text>

        {/* 재고 정보 */}
        <View style={styles.stockSection}>
          <Text style={styles.sectionTitle}>재고 정보</Text>
          {product.productItems.map((item, idx) => {
            const statusLabel =
              STATUS_OPTIONS.find(option => option.value === item.status)
                ?.label || item.status;
            return (
              <Text key={idx}>
                {item.size} - {item.stock}개 ({statusLabel})
              </Text>
            );
          })}
        </View>

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() =>
              navigation.navigate('AdminProductEdit', { productId })
            }
          >
            <Text style={styles.buttonText}>수정하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 300, height: 300, marginRight: 10, borderRadius: 8 },
  name: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  price: { fontSize: 20, color: '#000', marginBottom: 10 },
  description: { fontSize: 16, color: '#666', marginBottom: 20 },
  stockSection: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },

  buttonContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007BFF',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
