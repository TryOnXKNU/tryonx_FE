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

const SERVER_URL = 'http://localhost:8080';

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
  measurements?: {
    label: string;
    value: string;
  }[];
  liked?: boolean;
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

  // 상세 탭
  const [activeTab, setActiveTab] = useState<'info' | 'review' | 'qa'>('info');
  const scrollY = useRef(0);
  const infoRef = useRef<View>(null);
  const reviewRef = useRef<View>(null);
  const qaRef = useRef<View>(null);
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

  // 기존 handleBuy 함수 수정 -> 모달 열기
  const handleBuy = () => {
    if (!product?.size || product.size.length === 0) {
      Alert.alert('사이즈 정보가 없습니다.');
      return;
    }
    setSelectedSize(product.size[0]); // 기본 첫번째 사이즈 선택
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

  // 장바구니 버튼 눌렀을 때 (임시 alert 처리)
  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert('사이즈를 선택해 주세요.');
      return;
    }

    Alert.alert('장바구니에 추가되었습니다.');
    setModalVisible(false);
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

        // measurements 정보가 없으면 기본값 추가
        const productData = {
          ...response.data,
          liked: response.data.liked,
          likeCount: response.data.likeCount,
          measurements: response.data.measurements ?? [
            { label: '어깨', value: '48cm' },
            { label: '가슴', value: '56cm' },
            { label: '총장', value: '72cm' },
            { label: '소매길이', value: '63cm' },
          ],
        };

        setProduct(productData);
        setLikeCount(productData.likeCount);

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

  // (중략) dummy 데이터
  const dummyReviews = [
    {
      id: 1,
      author: '홍길동',
      rating: 5,
      content: '정말 좋아요!',
      date: '2025-07-01',
    },
    {
      id: 2,
      author: '김철수',
      rating: 4,
      content: '사이즈가 조금 작아요',
      date: '2025-07-02',
    },
    {
      id: 3,
      author: '김철수',
      rating: 4,
      content: '사이즈가 조금 작아요',
      date: '2025-07-02',
    },
  ];

  const dummyQas = [
    {
      id: 1,
      type: '사이즈',
      title: 'L 사이즈 있나요?',
      status: '답변 완료',
      date: '2025-06-25',
    },
    {
      id: 2,
      type: '배송',
      title: '배송 기간은?',
      status: '답변 대기',
      date: '2025-06-26',
    },
    {
      id: 3,
      type: '배송',
      title: '배송 기간은?',
      status: '답변 대기',
      date: '2025-06-26',
    },
  ];

  return (
    <View style={styles.container}>
      <Header showRightIcons={true} hideBackButton={false} />

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

            {/* <Text style={styles.sizeTitle}>사이즈</Text>

            <View style={styles.sizeContainer}>
              {product.size?.map(size => (
                <View key={size} style={styles.sizeBox}>
                  <Text style={styles.sizeText}>{size}</Text>
                </View>
              ))}
            </View> */}

            <View style={styles.tabContainer}>
              {['info', 'review', 'qa'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() =>
                    scrollToSection(tab as 'info' | 'review' | 'qa')
                  }
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
                    {tab === 'info'
                      ? '정보'
                      : tab === 'review'
                      ? '리뷰'
                      : '문의'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {product.measurements && (
              <>
                <Text style={styles.sizeTitle}>실측 사이즈</Text>
                <View style={styles.measureContainer}>
                  {product.measurements.map(measure => (
                    <View key={measure.label} style={styles.measureRow}>
                      <Text style={styles.measureLabel}>{measure.label}</Text>
                      <Text style={styles.measureValue}>{measure.value}</Text>
                    </View>
                  ))}
                </View>
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
          <View onLayout={measureSection('review')} ref={reviewRef}>
            <Text style={styles.sectionTitle}>
              리뷰 ({dummyReviews.length})
            </Text>

            {dummyReviews.slice(0, 2).map(r => (
              <View key={r.id} style={styles.itemMarginBottom}>
                <Text style={styles.reviewAuthor}>
                  {r.author} ({r.rating}★)
                </Text>
                <Text>{r.content}</Text>
                <Text style={styles.reviewDate}>{r.date}</Text>
              </View>
            ))}

            {dummyReviews.length > 2 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('ReviewList')}
                style={styles.reviewAllButton}
              >
                <Text style={styles.reviewAllButtonText}>리뷰 전체 보기</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 문의 섹션 */}
          <View onLayout={measureSection('qa')} ref={qaRef}>
            <View style={styles.qaHeader}>
              <Text style={styles.sectionTitle}>
                상품문의 ({dummyQas.length})
              </Text>
              {dummyQas.length > 2 && (
                <TouchableOpacity onPress={() => navigation.navigate('QaList')}>
                  <Text style={styles.qaMoreText}>더보기</Text>
                </TouchableOpacity>
              )}
            </View>

            {dummyQas.slice(0, 2).map(q => (
              <View key={q.id} style={styles.itemMarginBottom}>
                <Text style={styles.qaType}>{q.type} 문의</Text>
                <Text style={styles.qaType}>{q.title}</Text>
                <View style={styles.qaStatusRow}>
                  <Text style={[styles.qaStatusText]}>{q.status}</Text>
                  <Text style={styles.qaDate}>{q.date}</Text>
                </View>
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
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBuy} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>구매하기</Text>
        </TouchableOpacity>
      </View>

      {/* 3) 구매하기 모달 */}
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
            {product?.size.map(size => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeOption,
                  selectedSize === size && styles.sizeOptionSelected,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeOptionText,
                    selectedSize === size && styles.sizeOptionTextSelected,
                  ]}
                >
                  {size}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  imageScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 400,
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
    marginVertical: 10,
    fontWeight: '600',
  },
  reviewDate: {
    marginVertical: 10,
    fontSize: 12,
    color: '#666',
  },
  reviewAllButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 8,
  },
  reviewAllButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // 문의 섹션
  qaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 12,
  },
  qaMoreText: {
    fontSize: 14,
    color: '#888',
  },
  qaType: {
    marginVertical: 10,
    color: '#888',
    fontWeight: '700',
  },
  qaStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#888',
    marginVertical: 10,
  },
  qaStatusText: {
    color: '#888',
  },
  qaDate: {
    color: '#888',
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
});
