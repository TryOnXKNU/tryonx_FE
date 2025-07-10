import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Header from '../components/Header';

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

export default function ReviewListScreen() {
  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <Header
        title="리뷰 전체 보기"
        showRightIcons={true}
        hideBackButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {dummyReviews.map(review => (
          <View key={review.id} style={styles.reviewItem}>
            <Text style={styles.author}>
              {review.author} ({review.rating}★)
            </Text>
            <Text style={styles.content}>{review.content}</Text>
            <Text style={styles.date}>{review.date}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  reviewItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 12,
  },
  author: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
