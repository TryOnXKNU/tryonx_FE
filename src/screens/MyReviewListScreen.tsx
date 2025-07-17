import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

const SERVER_URL = 'http://localhost:8080';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

type Review = {
  reviewId: number;
  productId: number;
  productName: string;
  size: string;
  description: string;
  rating: number;
  createdAt: string;
  productImage: string;
  reviewImages: string[];
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

export default function MyReviewListScreen() {
  const { token } = useAuthStore();

  const navigation = useNavigation<NavigationProp>();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/v1/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data);
      } catch (error) {
        console.error('리뷰 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const deleteReview = async (reviewId: number) => {
    try {
      await axios.delete(`${SERVER_URL}/api/v1/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reviewId },
      });
      setReviews(prev => prev.filter(review => review.reviewId !== reviewId));
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.productRow}>
          <Pressable
            onPress={() =>
              navigation.navigate('ProductDetail', {
                productId: item.productId,
              })
            }
          >
            <Image
              source={{ uri: `${SERVER_URL}${item.productImage}` }}
              style={styles.productImage}
            />
          </Pressable>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {item.productName} / {item.size}
            </Text>
            <StarRating rating={item.rating} />
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            Alert.alert('리뷰 삭제', '정말 삭제하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              {
                text: '삭제',
                style: 'destructive',
                onPress: () => deleteReview(item.reviewId),
              },
            ])
          }
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>

      <Text style={styles.description}>{item.description}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {item.reviewImages.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: `${SERVER_URL}${img}` }}
            style={styles.reviewImage}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="리뷰 내역" showRightIcons={false} />
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => item.reviewId.toString()}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>현재 리뷰가 없습니다</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16 },
  loader: { marginTop: 32 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productRow: { flexDirection: 'row', flex: 1 },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  date: { fontSize: 12, color: '#999', marginTop: 5 },
  description: { fontSize: 14, marginVertical: 8 },
  reviewImage: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#d00',
    fontWeight: 'bold',
  },
  starRow: { flexDirection: 'row' },
  starFilled: { fontSize: 16, color: '#FFD700' },
  starEmpty: { fontSize: 16, color: '#ccc' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
