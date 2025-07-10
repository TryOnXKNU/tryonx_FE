import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp } from '@react-navigation/native';
import Header from '../components/Header';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { RootStackParamList } from '../navigation/types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

type ProductDetail = {
  productId: number;
  productName: string;
  productPrice: number;
  likeCount: number;
  categoryId: number;
  description: string;
  productImages: string[];
  size: string[];
};

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const token = useAuthStore(state => state.token);
  const { productId } = route.params;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // 좋아요 토글 상태 관리 (임시로 상태 추가)
  const [liked, setLiked] = useState(false);

  const toggleLike = async () => {
    try {
      await axios.post(
        `${SERVER_URL}/api/v1/${productId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLiked(prev => !prev);
    } catch (err) {
      console.error('좋아요 요청 실패:', err);
      Alert.alert('좋아요 실패', '다시 시도해 주세요.');
    }
  };

  const handleBuy = () => {
    Alert.alert('구매하기 클릭됨');
  };
  const SERVER_URL = 'http://localhost:8080';

  useEffect(() => {
    if (!token) return;

    async function fetchProductDetail() {
      setLoading(true);
      try {
        const response = await axios.get<ProductDetail>(
          `${SERVER_URL}/api/v1/products/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          },
        );
        setProduct(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetail();
  }, [productId, token]);

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return encodeURI(`${SERVER_URL}${url}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text>{error || '상품 정보가 없습니다.'}</Text>
      </View>
    );
  }

  const categoryNames: { [key: number]: string } = {
    1: 'Tops',
    2: 'Bottoms',
    3: 'Outerwear',
    4: 'Dresses',
  };

  // 스크롤 이벤트에서 현재 인덱스 계산
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (370 + 12)); // 이미지 폭 + marginRight 값 기준
    setCurrentIndex(index);
  };

  function getCategoryName(categoryId: number): string {
    if (categoryId >= 5 && categoryId <= 15) {
      return 'Accessories';
    }
    return categoryNames[categoryId] || 'Unknown';
  }

  const likedTextStyle = liked ? styles.likedColor : undefined;

  return (
    <View style={styles.container}>
      <Header showRightIcons={true} hideBackButton={false} />

      {product.productImages.length > 0 && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={scrollViewRef}
          >
            {product.productImages.map((imgUrl, index) => (
              <Image
                key={index}
                source={{ uri: getImageUrl(imgUrl) }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* 도트 페이징 */}
          <View style={styles.dotsContainer}>
            {product.productImages.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </>
      )}

      <ScrollView style={styles.infoScrollView}>
        <View style={styles.infoSection}>
          <Text style={styles.category}>
            {getCategoryName(product.categoryId)}
          </Text>
          <Text style={styles.name}>{product.productName}</Text>
          <View style={styles.likesRow}>
            <Icon name="heart" size={16} color="#e74c3c" />
            <Text style={styles.likesText}>
              {product.likeCount} 좋아요(추후 평점 리뷰 로 변경)
            </Text>
          </View>
          <Text style={styles.price}>
            {product.productPrice.toLocaleString()} 원
          </Text>

          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sizeTitle}>사이즈</Text>
          <View style={styles.sizeContainer}>
            {product.size.map(size => (
              <View key={size} style={styles.sizeBox}>
                <Text style={styles.sizeText}>{size}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 하단 탭 */}
      <View style={styles.bottomTab}>
        <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
          <Icon
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={liked ? '#e74c3c' : '#555'}
          />
          <Text style={[styles.likeCountText, likedTextStyle]}>
            {product.likeCount + (liked ? 1 : 0)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBuy} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>구매하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  imageScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  productImage: {
    width: 370,
    borderRadius: 14,
    marginRight: 12,
  },

  infoScrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  infoSection: {
    paddingBottom: 40,
  },

  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },

  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  likesText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },

  price: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
    color: '#000',
  },

  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 24,
  },

  sizeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },

  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  sizeBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },

  sizeText: {
    fontSize: 16,
    color: '#333',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 이미지 구분하기 위해서 점
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: '#000',
    width: 10,
    height: 10,
  },

  // 하단 탭
  bottomTab: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  likeButton: {
    flexDirection: 'column', // 세로 방향으로 정렬
    alignItems: 'center',
    paddingRight: 20,
  },

  likeCountText: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },

  likedColor: {
    color: '#e74c3c',
  },

  buyButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
