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
  discountRate: number;
  description: string;
  likeCount: number | null;
  categoryId: number;
  bodyShape: string;
  productImages: string[];
  productItems: {
    size: string;
    stock: number;
    status: string;
    length?: number;
    shoulder?: number;
    chest?: number;
    sleeveLength?: number;
    sleeve_length?: number;
    waist?: number;
    thigh?: number;
    rise?: number;
    hem?: number;
    hip?: number;
  }[];
  productReviews: any[];
};

// 상태 옵션 한글 매핑
const STATUS_OPTIONS = [
  { label: '판매중', value: 'AVAILABLE' },
  { label: '품절', value: 'SOLDOUT' },
  { label: '숨김', value: 'HIDDEN' },
];

const CATEGORY_OPTIONS = [
  { label: 'Top', value: 1 },
  { label: 'Bottom', value: 2 },
  { label: 'Outwear', value: 3 },
  { label: 'Dress', value: 4 },
  { label: 'Acc', value: 5 },
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
            const response = await axios.delete(
              `http://localhost:8080/api/v1/admin/product/${productId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: status => status === 200, // 200만 정상 처리
              },
            );

            const responseData = response.data;

            // 서버가 삭제 실패 메시지 반환 시 처리
            if (
              typeof responseData === 'string' &&
              responseData.includes('주문 상품이 존재합니다')
            ) {
              Alert.alert(
                '삭제 불가',
                '이미 등록된 상품입니다. 상품 상태를 숨김으로 수정해주세요.',
              );
              return;
            }

            // 정상 삭제 처리
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

  const hasDiscount = (product.discountRate ?? 0) > 0;
  const discountedPrice = hasDiscount
    ? Math.floor(product.productPrice * (100 - product.discountRate) * 0.01)
    : product.productPrice;

  return (
    <View style={styles.container}>
      <Header title="상품 상세" showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 이미지 캐러셀 */}
        <View style={styles.imageCarousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {product.productImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: `http://localhost:8080${img}` }}
                style={styles.image}
              />
            ))}
          </ScrollView>
          <View style={styles.imageDots}>
            {product.productImages.map((_, idx) => (
              <View key={idx} style={styles.dot} />
            ))}
          </View>
        </View>

        {/* 헤더 카드 */}
        <View style={styles.headerCard}>
          <Text style={styles.name}>{product.productName}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {discountedPrice.toLocaleString()}원
            </Text>
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  -{product.discountRate}%
                </Text>
              </View>
            )}
          </View>
          {hasDiscount && (
            <Text style={styles.originalPrice}>
              {product.productPrice.toLocaleString()}원
            </Text>
          )}
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {CATEGORY_OPTIONS.find(opt => opt.value === product.categoryId)
                  ?.label || 'Unknown'}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{product.bodyShape}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>❤ {product.likeCount ?? 0}</Text>
            </View>
          </View>
        </View>

        {/* 설명 카드 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>상품 설명</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* 기본 정보 카드 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>상품 ID</Text>
            <Text style={styles.infoVal}>{product.productId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>카테고리</Text>
            <Text style={styles.infoVal}>
              {CATEGORY_OPTIONS.find(opt => opt.value === product.categoryId)
                ?.label || product.categoryId}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>바디 쉐입</Text>
            <Text style={styles.infoVal}>{product.bodyShape}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>좋아요</Text>
            <Text style={styles.infoVal}>{product.likeCount ?? 0}</Text>
          </View>
        </View>

        {/* 재고/실측 카드 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>재고/실측</Text>
          {product.productItems.map((item, idx) => {
            const statusLabel =
              STATUS_OPTIONS.find(option => option.value === item.status)
                ?.label || item.status;
            const sleeve =
              (item as any).sleeveLength ?? (item as any).sleeve_length;
            return (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.size}</Text>
                  </View>
                  <Text style={styles.itemHeaderRight}>
                    {statusLabel} · {item.stock}개
                  </Text>
                </View>
                <View style={styles.measurementsGrid}>
                  <Text style={styles.measureText}>
                    총장: {item.length ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    어깨: {item.shoulder ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    가슴: {item.chest ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    소매 길이: {sleeve ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    허리: {item.waist ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    허벅지: {item.thigh ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    밑위: {item.rise ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    밑단: {item.hem ?? '-'}
                  </Text>
                  <Text style={styles.measureText}>
                    엉덩이: {item.hip ?? '-'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* 리뷰 섹션 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>리뷰</Text>
          {product.productReviews && product.productReviews.length > 0 ? (
            product.productReviews.map((review, idx) => (
              <View key={idx} style={styles.reviewItem}>
                <Text style={styles.reviewText}>
                  {typeof review === 'string' ? review : JSON.stringify(review)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>등록된 리뷰가 없습니다.</Text>
          )}
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
  imageCarousel: { marginHorizontal: -20, backgroundColor: '#f5f5f5' },
  image: { width: 360, height: 320, marginRight: 10, borderRadius: 0 },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ccc' },
  name: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  price: { fontSize: 22, color: '#000', marginTop: 2 },
  originalPrice: {
    color: '#888',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 7,
  },
  discountText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  tagsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: '#333' },
  description: { fontSize: 16, color: '#666', marginBottom: 20 },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  emptyText: { color: '#888', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoKey: { color: '#666' },
  infoVal: { color: '#111', fontWeight: '600' },
  itemCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fafafa',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    backgroundColor: '#111',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontWeight: '700' },
  itemHeaderRight: { color: '#555' },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measureText: { width: '48%', color: '#444' },
  reviewItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewText: { color: '#333', fontSize: 14 },

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
