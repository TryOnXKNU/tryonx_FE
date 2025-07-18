import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import Header from '../components/Header';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

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
  availableOrderSizes?: string[]; //  사이즈 목록
};

type ReviewListScreenRouteProp = RouteProp<RootStackParamList, 'ReviewList'>;

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

export default function ReviewListScreen() {
  const route = useRoute<ReviewListScreenRouteProp>();
  const { productId } = route.params;

  const token = useAuthStore(state => state.token);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'size' | 'body'>('size');

  // 단일 선택 사이즈
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  const [minHeight, setMinHeight] = useState<string>('0');
  const [maxHeight, setMaxHeight] = useState<string>('0');
  const [minWeight, setMinWeight] = useState<string>('0');
  const [maxWeight, setMaxWeight] = useState<string>('0');

  useEffect(() => {
    const fetchAvailableSizes = async () => {
      try {
        const res = await axios.get<ProductReview[]>(
          `http://localhost:8080/api/v1/reviews/product`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { productId },
          },
        );

        // 중복 제거
        const allSizes = res.data
          .flatMap(review => review.availableOrderSizes ?? [])
          .filter((v, i, arr) => arr.indexOf(v) === i);

        setAvailableSizes(allSizes);
      } catch (error) {
        console.error('사이즈 목록 불러오기 실패', error);
      }
    };

    const fetchReviewCount = async () => {
      try {
        const res = await axios.get<number>(
          `http://localhost:8080/api/v1/reviews/product/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { productId },
          },
        );
        setReviewCount(res.data);
      } catch (error) {
        console.error('리뷰 개수 불러오기 실패', error);
      }
    };

    fetchAvailableSizes();
    fetchReviewCount();
  }, [productId, token]);

  const fetchReviews = React.useCallback(
    async (filters?: any) => {
      setLoading(true);
      try {
        if (filters) {
          const requestData: any = { productId };

          if (filters.size) requestData.size = filters.size;
          if (filters.minHeight)
            requestData.minHeight = Number(filters.minHeight);
          if (filters.maxHeight)
            requestData.maxHeight = Number(filters.maxHeight);
          if (filters.minWeight)
            requestData.minWeight = Number(filters.minWeight);
          if (filters.maxWeight)
            requestData.maxWeight = Number(filters.maxWeight);

          const response = await axios.post<ProductReview[]>(
            'http://localhost:8080/api/v1/reviews/product/filter',
            requestData,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setReviews(response.data);
        } else {
          const response = await axios.get<ProductReview[]>(
            `http://localhost:8080/api/v1/reviews/product`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { productId },
            },
          );
          setReviews(response.data);
        }
      } catch (err) {
        console.error('리뷰 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    },
    [productId, token],
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const selectSize = (size: string) => {
    setSelectedSize(size);
  };

  const applyFilter = () => {
    const filters: any = { productId };

    if (selectedSize) filters.size = selectedSize;

    const minH = Number(minHeight);
    const maxH = Number(maxHeight);
    if (minH > 0) filters.minHeight = minH;
    if (maxH > 0) filters.maxHeight = maxH;

    const minW = Number(minWeight);
    const maxW = Number(maxWeight);
    if (minW > 0) filters.minWeight = minW;
    if (maxW > 0) filters.maxWeight = maxW;

    fetchReviews(filters);
    setModalVisible(false);
  };

  const openFilterModal = (tab: 'size' | 'body') => {
    setActiveTab(tab);
    setModalVisible(true);
  };

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  return (
    <View style={styles.container}>
      <Header
        title="리뷰 전체 보기"
        showRightIcons={true}
        hideBackButton={false}
      />

      <View style={styles.reviewCountContainer}>
        <Text style={styles.reviewCountText}>리뷰 ({reviewCount})</Text>
      </View>

      <View style={styles.filterTabsContainer}>
        <TouchableOpacity
          style={[
            styles.filterTabButton,
            activeTab === 'size' && styles.filterTabButtonActive,
          ]}
          onPress={() => openFilterModal('size')}
        >
          <Text
            style={
              activeTab === 'size'
                ? styles.filterTabTextActive
                : styles.filterTabText
            }
          >
            사이즈
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTabButton,
            activeTab === 'body' && styles.filterTabButtonActive,
          ]}
          onPress={() => openFilterModal('body')}
        >
          <Text
            style={
              activeTab === 'body'
                ? styles.filterTabTextActive
                : styles.filterTabText
            }
          >
            키/몸무게
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.headerRow}>
                {review.profileImageUrl && (
                  <Image
                    source={{
                      uri: `http://localhost:8080${review.profileImageUrl}`,
                    }}
                    style={styles.profileImage}
                  />
                )}
                <View style={styles.infoColumn}>
                  <Text style={styles.author}>{review.memberNickname}</Text>
                  <StarRating rating={review.rating} />
                  <Text style={styles.subInfo}>
                    {review.height}cm • {review.weight}kg • {review.size}
                  </Text>
                </View>
                <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
              </View>

              <Text style={styles.content}>{review.description}</Text>

              {review.reviewImages.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.reviewImagesContainer}
                >
                  {review.reviewImages.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: `http://localhost:8080${img}` }}
                      style={styles.reviewImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* 필터 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'size' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('size')}
              >
                <Text
                  style={
                    activeTab === 'size' ? styles.tabTextActive : styles.tabText
                  }
                >
                  사이즈
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'body' && styles.tabButtonActive,
                ]}
                onPress={() => setActiveTab('body')}
              >
                <Text
                  style={
                    activeTab === 'body' ? styles.tabTextActive : styles.tabText
                  }
                >
                  키/몸무게
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {activeTab === 'size' && (
                <View style={styles.checkboxContainer}>
                  {availableSizes.length === 0 && (
                    <Text style={styles.noSizesText}>
                      사용 가능한 사이즈 없음
                    </Text>
                  )}
                  {availableSizes.map(size => (
                    <TouchableOpacity
                      key={size}
                      style={styles.checkboxItem}
                      onPress={() => selectSize(size)}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          selectedSize === size && styles.radioCircleSelected,
                        ]}
                      />
                      <Text style={styles.checkboxLabel}>{size}</Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={[
                      styles.clearButton,
                      !selectedSize && styles.clearButtonDisabled,
                    ]}
                    onPress={() => setSelectedSize(null)}
                    disabled={!selectedSize}
                  >
                    <Text
                      style={[
                        styles.clearButtonText,
                        !selectedSize && styles.disabledText,
                      ]}
                    >
                      선택 해제
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'body' && (
                <View style={styles.bodyFilterContainer}>
                  <View style={styles.rangeRow}>
                    <Text style={styles.rangeLabel}>키 (cm)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="최소"
                      value={minHeight}
                      onChangeText={setMinHeight}
                    />
                    <Text style={styles.rangeDash}>-</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="최대"
                      value={maxHeight}
                      onChangeText={setMaxHeight}
                    />
                  </View>

                  <View style={styles.rangeRow}>
                    <Text style={styles.rangeLabel}>몸무게 (kg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="최소"
                      value={minWeight}
                      onChangeText={setMinWeight}
                    />
                    <Text style={styles.rangeDash}>-</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="최대"
                      value={maxWeight}
                      onChangeText={setMaxWeight}
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilter}
              >
                <Text style={styles.applyButtonText}>적용</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  loadingIndicator: {
    marginTop: 20,
    alignSelf: 'center',
  },
  reviewCountContainer: {
    padding: 12,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  reviewCountText: { fontSize: 16, fontWeight: '600' },
  filterTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterTabButton: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  filterTabButtonActive: {
    borderBottomColor: '#222',
  },
  filterTabText: { color: '#666', fontWeight: '600' },
  filterTabTextActive: { color: '#222', fontWeight: '700' },

  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 12, paddingBottom: 24 },
  reviewItem: {
    marginBottom: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  headerRow: {
    padding: 10,
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  author: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  starRow: { flexDirection: 'row', marginBottom: 4 },
  starFilled: { color: '#f5c518', fontSize: 16 },
  starEmpty: { color: '#ddd', fontSize: 16 },
  subInfo: { fontSize: 12, color: '#555' },
  content: { fontSize: 14, color: '#333', marginBottom: 8, padding: 10 },
  reviewImagesContainer: { marginVertical: 8 },
  reviewImage: {
    width: 90,
    height: 90,
    borderRadius: 6,
    marginRight: 8,
  },
  date: { fontSize: 10, color: '#999' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  modalContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: '80%',
    paddingBottom: 12,
  },

  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: { borderBottomColor: '#222' },
  tabText: { fontWeight: '600', color: '#666' },
  tabTextActive: { fontWeight: '700', color: '#222' },

  checkboxContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 11,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#222',
  },
  noSizesText: { textAlign: 'center', color: '#999', marginTop: 20 },

  clearButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  clearButtonDisabled: {},
  clearButtonText: {
    color: '#222',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  disabledText: {
    color: '#999',
  },

  bodyFilterContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rangeLabel: {
    fontWeight: '600',
    fontSize: 14,
    width: 80,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    width: 70,
    textAlign: 'center',
  },
  rangeDash: {
    marginHorizontal: 6,
    fontSize: 16,
    fontWeight: '600',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingHorizontal: 12,
  },
  applyButton: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  applyButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 16,
  },
});
