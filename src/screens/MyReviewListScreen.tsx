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
} from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';

const SERVER_URL = 'http://localhost:8080';

type Review = {
  reviewId: number;
  productName: string;
  size: string;
  description: string;
  createdAt: string;
  productImage: string;
  reviewImages: string[];
};

export default function MyReviewListScreen() {
  const { token } = useAuthStore();
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

  const deleteReview = async (reviewId: number) => {
    try {
      await axios.delete(`${SERVER_URL}/api/v1/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reviewId }, // body에 포함됨
      });
      setReviews(prev => prev.filter(review => review.reviewId !== reviewId));
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.productRow}>
          <Image
            source={{ uri: `${SERVER_URL}${item.productImage}` }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {item.productName} / {item.size}
            </Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
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
        <Text
          style={styles.deleteButton}
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
        >
          삭제
        </Text>
      </View>
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
  cardHeader: {
    paddingBottom: 8,
  },

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
  productRow: { flexDirection: 'row', marginBottom: 10 },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  date: { fontSize: 12, color: '#999' },
  description: { fontSize: 14, marginBottom: 8 },
  reviewImage: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    color: '#d00',
    fontSize: 13,
    fontWeight: '500',
  },
  //리뷰 없을 경우
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
