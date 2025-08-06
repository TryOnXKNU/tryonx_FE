import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import Header from '../../components/Header';

interface ServerImage {
  id: number;
  url: string;
}

interface ProductItem {
  size: string;
  stock: number;
  status: string;
  length: number;
  shoulder: number;
  chest: number;
  sleeve_length: number;
  waist: number;
  thigh: number;
  rise: number;
  hem: number;
  hip: number;
}

interface ProductDetail {
  productId: number;
  productName: string;
  productPrice: number;
  likeCount: number | null;
  categoryId: number;
  description: string;
  productImages: string[];
  productItems: ProductItem[];
}

export default function AdminProductEditScreen() {
  const { params } = useRoute<any>();
  const { productId } = params;
  const token = useAuthStore(state => state.token);

  const [loading, setLoading] = useState(false);

  // 전체 상품 정보 저장
  const [product, setProduct] = useState<ProductDetail | null>(null);
  // 이미지 상태 따로 관리 (id 부여)
  const [images, setImages] = useState<ServerImage[]>([]);

  const SERVER_BASE_URL = 'http://localhost:8080';

  // 수정 가능하게 form 상태 분리
  const [form, setForm] = useState({
    productName: '',
    productPrice: '',
    categoryId: '',
    description: '',
  });

  const fetchProductDetail = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${SERVER_BASE_URL}/api/v1/admin/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data: ProductDetail = response.data;

      setProduct(data);

      const imagesWithId =
        data.productImages?.map((url: string, index: number) => ({
          id: index,
          url,
        })) || [];
      setImages(imagesWithId);

      // form 초기값 설정
      setForm({
        productName: data.productName,
        productPrice: data.productPrice.toString(),
        categoryId: data.categoryId.toString(),
        description: data.description,
      });
    } catch (error) {
      console.error('상품 불러오기 실패:', error);
      Alert.alert('오류', '상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  const deleteServerImage = async (imageUrl: string) => {
    if (!token) return;
    Alert.alert(
      '이미지 삭제',
      '이미지를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(
                `${SERVER_BASE_URL}/api/v1/admin/product/${productId}/image`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  data: { imageUrl },
                },
              );
              setImages(prev => prev.filter(img => img.url !== imageUrl));
              Alert.alert('삭제 완료', '이미지가 삭제되었습니다.');
            } catch (e) {
              console.error('이미지 삭제 실패:', e);
              Alert.alert('실패', '이미지 삭제에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleInputChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="상품 수정" showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>상품명</Text>
        <TextInput
          style={styles.input}
          value={form.productName}
          onChangeText={text => handleInputChange('productName', text)}
          placeholder="상품명을 입력하세요"
        />

        <Text style={styles.label}>가격</Text>
        <TextInput
          style={styles.input}
          value={form.productPrice}
          onChangeText={text => handleInputChange('productPrice', text)}
          placeholder="가격을 입력하세요"
          keyboardType="numeric"
        />

        <Text style={styles.label}>카테고리 ID</Text>
        <TextInput
          style={styles.input}
          value={form.categoryId}
          onChangeText={text => handleInputChange('categoryId', text)}
          placeholder="카테고리 ID를 입력하세요"
          keyboardType="numeric"
        />

        <Text style={styles.label}>설명</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={form.description}
          onChangeText={text => handleInputChange('description', text)}
          placeholder="설명을 입력하세요"
          multiline
        />

        <Text style={styles.label}>상품 이미지</Text>
        <View style={styles.imagePreview}>
          {images.map(img => (
            <View
              key={img.id}
              style={{ position: 'relative', marginRight: 10 }}
            >
              <Image
                source={{
                  uri: img.url.startsWith('http')
                    ? img.url
                    : `${SERVER_BASE_URL}${img.url}`,
                }}
                style={styles.image}
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteServerImage(img.url)}
              >
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.label}>상품 사이즈 및 재고</Text>
        {product.productItems.length === 0 && (
          <Text style={styles.value}>등록된 상품 아이템이 없습니다.</Text>
        )}
        {product.productItems.map((item, idx) => (
          <View key={idx} style={styles.productItemContainer}>
            <Text style={styles.productItemText}>사이즈: {item.size}</Text>
            <Text style={styles.productItemText}>재고: {item.stock}</Text>
            <Text style={styles.productItemText}>상태: {item.status}</Text>
            <Text style={styles.productItemText}>가로 길이: {item.length}</Text>
            <Text style={styles.productItemText}>어깨: {item.shoulder}</Text>
            <Text style={styles.productItemText}>가슴: {item.chest}</Text>
            <Text style={styles.productItemText}>
              소매 길이: {item.sleeve_length}
            </Text>
            {/* 필요한 다른 필드도 마찬가지로 출력 */}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    marginTop: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  imagePreview: {
    flexDirection: 'row',
    marginTop: 10,
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  deleteButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  deleteButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  productItemContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  productItemText: {
    fontSize: 14,
    marginBottom: 2,
  },
});
