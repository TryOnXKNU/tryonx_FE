import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

const SERVER_URL = 'http://localhost:8080';

type InquiryDetail = {
  askId: number;
  nickname: string;
  productName: string;
  size: string;
  askTitle: string;
  content: string;
  answer: string;
  createdAt: string;
  answeredAt: string;
  userImageUrls: string[];
  productImageUrls: string[];
};

// 날짜를 "YY.MM.DD" 형식으로 변환하는 함수
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear() % 100;
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year.toString().padStart(2, '0')}.${month
    .toString()
    .padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
}

export default function AdminAskDetailScreen() {
  const { params } = useRoute<any>();
  const { askId } = params;

  const token = useAuthStore(state => state.token);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/api/v1/admin/asks/completed/${askId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setDetail(res.data);
      } catch (err) {
        Alert.alert('오류', '문의 상세를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [askId, token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        <Text>데이터를 불러오지 못했습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="문의 관리" hideBackButton={false} showRightIcons={false} />
      <View style={styles.content}>
        {/* 상단 박스 */}
        <View style={styles.topSection}>
          <Image
            source={{
              uri: `${SERVER_URL}${detail.productImageUrls?.[0] || ''}`,
            }}
            style={styles.mainImage}
          />
          <View style={styles.topTextBox}>
            <Text style={styles.askTitle}>{detail.askTitle}</Text>
            <Text style={styles.productInfo}>
              {detail.productName} / {detail.size}
            </Text>
            <Text style={styles.subInfo}>{detail.nickname}</Text>
            <Text style={styles.subInfo}>{formatDate(detail.createdAt)}</Text>
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.separator} />

        {/* 문의 내용 */}
        <Text style={styles.sectionTitle}>문의 내용</Text>
        <Text style={styles.contentText}>{detail.content}</Text>

        {(detail.userImageUrls?.length ?? 0) > 0 && (
          <FlatList
            data={detail.userImageUrls}
            horizontal
            keyExtractor={(uri, idx) => `img-${idx}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `${SERVER_URL}${item}` }}
                style={styles.subImage}
              />
            )}
            contentContainerStyle={styles.subImageList}
          />
        )}

        {/* 구분선 */}
        <View style={styles.separator} />

        {/* 답변 내용 */}
        <Text style={styles.sectionTitle}>답변</Text>
        <Text style={styles.contentText}>{detail.answer}</Text>
        <Text style={styles.answerDate}>{formatDate(detail.answeredAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topSection: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  mainImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  topTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  askTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  productInfo: { fontSize: 14, color: '#333', marginBottom: 4 },
  subInfo: { fontSize: 12, color: '#666' },

  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  subImage: {
    width: 90,
    height: 90,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  subImageList: { marginTop: 10 },

  answerDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
  },
});
