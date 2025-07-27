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
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { saveRecentItem } from '../utils/recentStorage';

const SERVER_URL = 'http://localhost:8080';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

type ProductItem = {
  size: string;
  stock: number;
  length: number;
  shoulder: number;
  chest: number;
  sleeve_length: number;
  waist: number;
  thigh: number;
  rise: number;
  hem: number;
  hip: number;
};

type ProductReview = {
  memberNickname: string;
  height: number;
  weight: number;
  profileImageUrl: string;
  rating: number;
  productId: number;
  productName: string;
  size: string;
  description: string;
  createdAt: string;
  reviewImages: string[];
};

type ProductDetail = {
  productId: number;
  productName: string;
  productPrice: number;
  likeCount: number;
  categoryId: number;
  description: string;
  productImages: string[];

  size: string[];

  measurements?: {
    size: string;
    values: {
      label: string;
      value: string;
    }[];
  }[];

  liked?: boolean;
  productItems: ProductItem[];
  productReviews: ProductReview[];
};

const StarRating = ({ rating }: { rating: number }) => {
  const maxStars = 5;
  return (
    <View style={styles.starRow}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <Text key={i} style={i < rating ? styles.starFilled : styles.starEmpty}>
          ★
        </Text>
      ))}
    </View>
  );
};

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const token = useAuthStore(state => state.token);
  const { productId } = route.params;

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [product, setProduct] = useState<ProductDetail | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // 리뷰 카운트
  const [reviewCount, setReviewCount] = useState<number>(0);

  // 좋아요 토글 상태 관리
  const [liked, setLiked] = useState(false);
  // 서버로부터 받은 likeCount 상태를 따로 관리 (좋아요 상태 반영용)
  const [likeCount, setLikeCount] = useState(0);

  // 모달(구매하기 버튼 누를때)
  // 1) 모달 상태 추가
  const [modalVisible, setModalVisible] = useState(false);

  // 2) 사이즈 선택 상태, 수량 상태 추가
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // 장바구니 담은 뒤 모달
  const [showCartModal, setShowCartModal] = useState(false);

  // 상세 탭
  const [activeTab, setActiveTab] = useState<'info' | 'review' | 'qa'>('info');
  const scrollY = useRef(0);
  const infoRef = useRef<View>(null);
  const reviewRef = useRef<View>(null);

  const mainScrollRef = useRef<ScrollView>(null);

  // 섹션별 y 좌표 저장
  const sectionTops = useRef<{ info?: number; review?: number; qa?: number }>(
    {},
  );

  // 스크롤 시 현재 위치 기반으로 activeTab 변경
  const handleMainScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.current = y;

    const sectionOffsets = sectionTops.current;

    if (sectionOffsets.qa !== undefined && y >= sectionOffsets.qa - 100) {
      setActiveTab('qa');
    } else if (
      sectionOffsets.review !== undefined &&
      y >= sectionOffsets.review - 100
    ) {
      setActiveTab('review');
    } else {
      setActiveTab('info');
    }
  };

  // 섹션 탭 누르면 해당 위치로 스크롤
  const scrollToSection = (section: 'info' | 'review' | 'qa') => {
    let y = sectionTops.current[section] ?? 0;
    mainScrollRef.current?.scrollTo({ y: y - 90, animated: true });
    setActiveTab(section); // 여기에 추가
  };

  // 좋아요 상태에 따라 텍스트 색상 다르게
  const likedTextStyle = {
    color: liked ? '#e74c3c' : '#555',
  };

  // 좋아요 토글 함수
  const toggleLike = async () => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/v1/${productId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 서버에서 응답으로 받은 liked, likeCount 값 사용
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch (err) {
      console.error('좋아요 요청 실패:', err);
      Alert.alert('좋아요 실패', '다시 시도해 주세요.');
    }
  };

  // handleBuy 함수 -> 모달 열기
  const handleBuy = () => {
    if (!product?.productItems || product.productItems.length === 0) {
      Alert.alert('사이즈 정보가 없습니다.');
      return;
    }
    setSelectedSize(product.productItems[0].size); // 첫 번째 사이즈 기본 선택
    setQuantity(1);
    setModalVisible(true);
  };

  // 모달 내 구매하기 버튼 클릭 시 주문서 페이지로 이동
  const handleConfirmPurchase = () => {
    if (!selectedSize) {
      Alert.alert('사이즈를 선택해 주세요.');
      return;
    }

    setModalVisible(false);
    // 주문서 페이지로 navigation, 선택 정보 params로 전달
    navigation.navigate('OrderSheet', {
      productId: product?.productId || 0,
      size: selectedSize,
      quantity,
    });
  };

  // 장바구니 버튼 눌렀을 때
  const handleAddToCart = async () => {
    if (!selectedSize || !product) {
      Alert.alert('사이즈를 선택해 주세요.');
      return;
    }

    try {
      await axios.post(
        `${SERVER_URL}/api/v1/cart`,
        {
          items: [
            {
              productId: product.productId,
              size: selectedSize,
              quantity,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 장바구니 성공 시 모달 열기
      setShowCartModal(true);
      setModalVisible(false);
    } catch (cartError) {
      console.error('장바구니 추가 실패:', cartError);
      Alert.alert('장바구니 추가 실패', '다시 시도해 주세요.');
    }
  };

  // 각 productItem별로 측정값 배열 생성
  const formatMeasurementsForAll = (items: ProductItem[]) => {
    return items.map(item => ({
      size: item.size,
      values: [
        { label: '어깨', value: item.shoulder },
        { label: '가슴', value: item.chest },
        { label: '총장', value: item.length },
        { label: '소매길이', value: item.sleeve_length },
        { label: '허리', value: item.waist },
        { label: '허벅지', value: item.thigh },
        { label: '밑위', value: item.rise },
        { label: '밑단', value: item.hem },
        { label: '엉덩이', value: item.hip },
      ]
        .filter(m => m.value !== null && m.value !== undefined && m.value !== 0)
        .map(m => ({ label: m.label, value: `${m.value}cm` })),
    }));
  };

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

        // API 응답 받아서 처리할 때
        const productData = {
          ...response.data,
          liked: response.data.liked,
          likeCount: response.data.likeCount,
          measurements:
            response.data.productItems?.length > 0
              ? formatMeasurementsForAll(response.data.productItems)
              : [],
        };

        setProduct(productData);
        setLikeCount(productData.likeCount);

        // 리뷰 카운트
        try {
          const reviewCountRes = await axios.get<number>(
            `${SERVER_URL}/api/v1/reviews/product/count`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { productId },
            },
          );
          setReviewCount(reviewCountRes.data);
        } catch (err) {
          console.error('리뷰 개수 불러오기 실패:', err);
        }

        // 좋아요 누른 상품 목록 가져오기
        const likesRes = await axios.get<
          { productId: number; productName: string; imageUrl: string }[]
        >(`${SERVER_URL}/api/v1/likes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 현재 상품이 좋아요 목록에 있으면 liked true
        const likedProductIds = likesRes.data.map(item => item.productId);
        setLiked(likedProductIds.includes(productId));

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

  // 최근 본 상품 저장
  useEffect(() => {
    if (
      product?.productId &&
      product?.productName &&
      product?.productImages &&
      product.productImages.length > 0 &&
      product?.productPrice
    ) {
      saveRecentItem({
        id: String(product.productId),
        name: product.productName,
        imageUrl: getImageUrl(product.productImages[0]),
        price: product.productPrice,
      });
    }
  }, [product]);

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return encodeURI(`${SERVER_URL}${url}`);
  };

  // 이미지 스크롤 인덱스 계산 (가로 스크롤)
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (370 + 12)); // 이미지 폭 + marginRight 값 기준
    setCurrentIndex(index);
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

  function getCategoryName(categoryId: number): string {
    if (categoryId >= 5 && categoryId <= 15) {
      return 'Accessories';
    }
    return categoryNames[categoryId] || 'Unknown';
  }

  // ScrollView 내 섹션 컴포넌트 위치 측정 후 저장하는 함수
  const measureSection =
    (section: 'info' | 'review' | 'qa') => (event: any) => {
      const layout = event.nativeEvent.layout;
      sectionTops.current[section] = layout.y;
    };

  return (
    <View style={styles.container}>
      <Header
        showRightIcons={true}
        showHomeButton={true}
        hideBackButton={false}
      />

      <ScrollView
        style={styles.container}
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
      >
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
                  style={[
                    styles.dot,
                    currentIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </>
        )}

        <View style={styles.infoScrollView}>
          <View
            onLayout={measureSection('info')}
            ref={infoRef}
            style={styles.infoSection}
          >
            <Text style={styles.category}>
              {getCategoryName(product.categoryId)}
            </Text>
            <Text style={styles.name}>{product.productName}</Text>
            <View style={styles.likesRow}>
              <Icon name="heart" size={16} color="#e74c3c" />
              <Text style={styles.likesText}>
                {likeCount} 좋아요(추후 평점 리뷰 로 변경)
              </Text>
            </View>
            <Text style={styles.price}>
              {product.productPrice.toLocaleString()} 원
            </Text>

            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.tabContainer}>
              {['info', 'review'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => scrollToSection(tab as 'info' | 'review')}
                  style={[
                    styles.tabItem,
                    activeTab === tab && styles.activeTabItem, // 밑줄 색 바꾸는 부분
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.activeTabText, // 글씨 색 바꾸는 부분
                    ]}
                  >
                    {tab === 'info' ? '정보' : '리뷰'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {product.measurements && product.measurements.length > 0 && (
              <>
                <Text style={styles.sizeTitle}>실측 사이즈</Text>
                {product.measurements.map(measurement => (
                  <View key={measurement.size} style={styles.measureContainer}>
                    <Text style={styles.sizeLabel}>
                      {measurement.size} 사이즈
                    </Text>
                    {measurement.values.map(measure => (
                      <View key={measure.label} style={styles.measureRow}>
                        <Text style={styles.measureLabel}>{measure.label}</Text>
                        <Text style={styles.measureValue}>{measure.value}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}

            {/* 상세 이미지 */}
            <View style={styles.imagesWrapper}>
              {product.productImages.map((imgUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: getImageUrl(imgUrl) }}
                  style={styles.productImageGrid}
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>

          {/* 리뷰 섹션 */}
          {product?.productReviews && (
            <View onLayout={measureSection('review')} ref={reviewRef}>
              <Text style={styles.sectionTitle}>리뷰 {reviewCount}</Text>

              {product.productReviews.slice(0, 2).map((r, idx) => (
                <View key={idx} style={styles.itemMarginBottom}>
                  <View style={styles.reviewRow}>
                    <Image
                      source={{ uri: `${SERVER_URL}${r.profileImageUrl}` }}
                      style={styles.profileImage}
                    />
                    <StarRating rating={r.rating} />
                  </View>
                  <Text>{r.description}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}

              {/* 리뷰 전체 보기 버튼 (검정 배경, 흰글씨) */}
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ReviewList', {
                    productId: product.productId,
                  })
                }
                style={styles.reviewAllButton}
              >
                <Text style={styles.reviewAllButtonText}>
                  {reviewCount}건 리뷰 전체 보기
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBuy} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>구매하기</Text>
        </TouchableOpacity>
      </View>

      {/* 구매하기 모달 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        />

        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>사이즈 선택</Text>
          <View style={styles.sizeOptionsContainer}>
            {product?.productItems.map(item => (
              <TouchableOpacity
                key={item.size}
                style={[
                  styles.sizeOption,
                  selectedSize === item.size && styles.sizeOptionSelected,
                ]}
                onPress={() => setSelectedSize(item.size)}
              >
                <Text
                  style={[
                    styles.sizeOptionText,
                    selectedSize === item.size && styles.sizeOptionTextSelected,
                  ]}
                >
                  {item.size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.modalTitle, styles.modalTitleWithMarginTop]}>
            수량 선택
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(q => (q > 1 ? q - 1 : 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(q => q + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBottomButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cartButton]}
              onPress={handleAddToCart}
            >
              <Text style={styles.modalButtonText}>장바구니</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirmPurchase}
            >
              <Text
                style={[styles.modalButtonText, styles.modalButtonTextWhite]}
              >
                구매하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCartModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCartModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCartModal(false)}
        />
        <View style={styles.cartSuccessModal}>
          <Text style={styles.cartSuccessText}>
            장바구니에 상품을 담았어요!
          </Text>
          <View style={styles.cartSuccessButtons}>
            <TouchableOpacity
              style={styles.cartModalButton}
              onPress={() => setShowCartModal(false)}
            >
              <Text style={styles.cartModalButtonText}>계속 쇼핑하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cartModalButton, styles.cartModalButtonGo]}
              onPress={() => {
                setShowCartModal(false);
                navigation.navigate('Cart');
              }}
            >
              <Text
                style={[
                  styles.cartModalButtonText,
                  styles.cartModalButtonTextWhite,
                ]}
              >
                장바구니 보러가기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 400,
  },

  sizeLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
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
    marginTop: 16,
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

  //좋아요
  likeButton: {
    flexDirection: 'column',
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

  // 구매 버튼
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

  // 탭 구분
  measureContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },

  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  measureLabel: {
    fontSize: 16,
    color: '#555',
  },

  measureValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
  },

  tabItem: {
    marginRight: 30,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  activeTabItem: {
    borderBottomColor: '#000', // 밑줄 색
  },

  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },

  activeTabText: {
    color: '#000',
  },

  imagesWrapper: {
    marginTop: 16,
    flexDirection: 'column', // 세로 정렬
    // justifyContent: 'space-between', // 없어도 됨
  },

  productImageGrid: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 12,
  },

  // 리뷰 섹션
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  itemMarginBottom: {
    marginBottom: 12,
  },

  reviewAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  reviewAllButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    alignItems: 'center',
  },
  reviewAllButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#eee', // 로딩 전 빈 배경
  },

  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  modalTitleWithMarginTop: {
    marginTop: 20,
  },
  modalButtonTextWhite: {
    color: '#fff',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },

  sizeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  sizeOption: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    marginBottom: 10,
  },

  sizeOptionSelected: {
    borderColor: '#000',
    backgroundColor: '#000',
  },

  sizeOptionText: {
    fontSize: 16,
    color: '#333',
  },

  sizeOptionTextSelected: {
    color: '#fff',
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonText: {
    fontSize: 24,
    color: '#333',
    lineHeight: 24,
  },

  quantityText: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
  },

  modalBottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  cartButton: {
    backgroundColor: '#eee',
  },

  confirmButton: {
    backgroundColor: '#000',
  },

  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },

  //장바 모달
  cartSuccessModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    alignItems: 'center',
  },

  cartSuccessText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  cartSuccessButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  cartModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
    alignItems: 'center',
  },

  cartModalButtonGo: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },

  cartModalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  cartModalButtonTextWhite: {
    color: '#fff',
  },

  //별점
  starRow: { flexDirection: 'row', marginBottom: 4 },
  starFilled: { color: '#f5c518', fontSize: 16 },
  starEmpty: { color: '#ddd', fontSize: 16 },
});
