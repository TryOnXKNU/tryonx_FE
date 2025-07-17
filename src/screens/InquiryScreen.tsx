import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

import Icon from 'react-native-vector-icons/Ionicons';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

const SERVER_URL = 'http://localhost:8080';
const Tab = createMaterialTopTabNavigator();

export default function InquiryScreen() {
  return (
    <View style={styles.container}>
      <Header title="문의" showRightIcons={false} hideBackButton={false} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#111827', // 검정색 텍스트
          tabBarIndicatorStyle: { backgroundColor: '#111827' }, // 검정색 밑줄
          tabBarLabelStyle: { fontWeight: '700', fontSize: 14 },
          tabBarStyle: { backgroundColor: '#fff' }, // 배경색
        }}
      >
        <Tab.Screen name="문의하기" component={InquiryListTab} />
        <Tab.Screen name="문의내역" component={MyInquiriesTab} />
      </Tab.Navigator>
    </View>
  );
}

// 문의하기 탭 타입 및 컴포넌트
type AvailableProduct = {
  orderItemId: number;
  productName: string;
  size: string;
  imgUrl: string;
};

function InquiryListTab() {
  const token = useAuthStore(state => state.token);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [products, setProducts] = useState<AvailableProduct[]>([]);

  const fetchAvailable = useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/v1/ask/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (err) {
      Alert.alert('오류', '문의 가능한 상품을 불러오는 데 실패했습니다.');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchAvailable();
    }, [fetchAvailable]),
  );

  //   useEffect(() => {
  //     fetchAvailable();
  //   }, [fetchAvailable]);

  const renderItem = ({ item }: { item: AvailableProduct }) => (
    <View style={styles.productItem}>
      <Image
        source={{
          uri: item.imgUrl
            ? `${SERVER_URL}${item.imgUrl}`
            : 'https://via.placeholder.com/100',
        }}
        style={styles.productImage}
      />
      <View style={styles.flexOne}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productSize}>{item.size}</Text>
      </View>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AskForm', {
            orderItemId: item.orderItemId,
            productName: item.productName,
            size: item.size,
            imgUrl: item.imgUrl,
          })
        }
      >
        <Icon name="chevron-forward" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
  return (
    <FlatList
      data={products}
      keyExtractor={(item, index) =>
        `${item.productName}-${item.size}-${index}`
      }
      renderItem={renderItem}
      contentContainerStyle={
        products.length === 0
          ? [
              styles.contentPadding,
              { flex: 1, justifyContent: 'center', alignItems: 'center' },
            ]
          : styles.contentPadding
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>문의 가능한 상품이 없습니다.</Text>
      }
    />
  );
}

// 문의내역 탭 타입 및 컴포넌트
type MyInquiry = {
  askId: number;
  title: string;
  answerStatus: 'WAITING' | 'ANSWERED' | string;
  createdAt: string;
};

type FullInquiry = {
  askId: number;
  title: string;
  productName: string;
  size: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  answerStatus: 'WAITING' | 'ANSWERED';
  answer: string | null;
  answeredAt: string | null;
};

function MyInquiriesTab() {
  const token = useAuthStore(state => state.token);
  const [inquiries, setInquiries] = useState<MyInquiry[]>([]);
  const [detailMap, setDetailMap] = useState<Record<number, FullInquiry>>({});

  const [expandedAskId, setExpandedAskId] = useState<number | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/v1/ask/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries(res.data);
    } catch (err) {
      Alert.alert('오류', '문의 내역을 불러오는 데 실패했습니다.');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, [fetchInquiries]),
  );

  const toggleExpand = async (askId: number) => {
    if (expandedAskId === askId) {
      setExpandedAskId(null);
    } else {
      setExpandedAskId(askId);
      if (!detailMap[askId]) {
        try {
          const res = await axios.get(`${SERVER_URL}/api/v1/ask/${askId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDetailMap(prev => ({ ...prev, [askId]: res.data }));
        } catch (err) {
          Alert.alert('오류', '문의 상세 정보를 불러오는 데 실패했습니다.');
        }
      }
    }
  };

  // 문의 삭제 함수
  const deleteInquiry = (askId: number) => {
    Alert.alert(
      '삭제 확인',
      '정말로 이 문의를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${SERVER_URL}/api/v1/ask/${askId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('삭제 완료', '문의가 삭제되었습니다.');
              // 삭제 후 문의 목록 새로고침
              fetchInquiries();
              // 삭제한 항목이 펼쳐져 있으면 접기
              if (expandedAskId === askId) setExpandedAskId(null);
              // 상세 정보도 삭제
              setDetailMap(prev => {
                const copy = { ...prev };
                delete copy[askId];
                return copy;
              });
            } catch (err) {
              Alert.alert('오류', '문의 삭제에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();

      // 폴링 타이머 설정
      const intervalId = setInterval(() => {
        fetchInquiries();
      }, 30000); // 30초마다

      return () => clearInterval(intervalId);
    }, [fetchInquiries]),
  );

  const renderItem = ({ item }: { item: MyInquiry }) => {
    const isWaiting = item.answerStatus === 'WAITING';
    const isExpanded = item.askId === expandedAskId;

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.askId)}
        style={styles.inquiryItem}
        activeOpacity={0.8}
      >
        <View style={styles.inquiryHeader}>
          <View style={[styles.inquiryHeader, styles.space]}>
            <View style={styles.delContainer}>
              <Text style={styles.inquiryTitle}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => deleteInquiry(item.askId)}
                style={styles.delBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.delText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inquiryStatusContainer}>
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6B7280"
              style={styles.iconMarginLeft}
            />
          </View>
        </View>
        <View style={styles.dateStatusContainer}>
          <Text
            style={[
              styles.inquiryStatusText,
              isWaiting
                ? styles.inquiryStatusWaiting
                : styles.inquiryStatusAnswered,
            ]}
          >
            {isWaiting ? '답변 대기중' : '답변 완료'}
          </Text>

          <Text style={styles.inquiryDate}>
            {new Date(item.createdAt).toLocaleDateString('ko-KR')}
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.inquiryDetail}>
            {detailMap[item.askId] ? (
              <>
                <Text style={styles.detailText}>
                  <Text style={styles.boldLabel}>
                    {detailMap[item.askId].productName}{' '}
                    {detailMap[item.askId].size}
                  </Text>
                </Text>

                <Text style={styles.detailText}>
                  {detailMap[item.askId].content}
                </Text>

                {detailMap[item.askId].imageUrls.length > 0 && (
                  <View style={styles.imageContainer}>
                    {detailMap[item.askId].imageUrls.map((imgUrl, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: `${SERVER_URL}${imgUrl}` }}
                        style={styles.inquiryImage}
                        resizeMode="contain"
                      />
                    ))}
                  </View>
                )}

                <Text style={styles.detailText}>
                  <Text style={styles.boldLabel}>답변:</Text>{' '}
                  {detailMap[item.askId].answer || '아직 답변이 없습니다.'}
                </Text>
              </>
            ) : (
              <Text style={styles.detailText}>로딩 중...</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={inquiries}
      keyExtractor={(item, index) => `${item.title}-${index}`}
      renderItem={renderItem}
      contentContainerStyle={
        inquiries.length === 0
          ? [
              styles.contentPadding,
              { flex: 1, justifyContent: 'center', alignItems: 'center' },
            ]
          : styles.contentPadding
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>문의 내역이 없습니다.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentPadding: {
    padding: 16,
    backgroundColor: '#fff',
  },
  flexOne: {
    flex: 1,
  },

  // 문의하기 탭
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  productSize: {
    fontSize: 13,
    color: '#6B7280',
  },
  inquireButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // 문의내역 탭
  inquiryItem: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingHorizontal: 5,
    paddingTop: 10,
    paddingBottom: 20,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inquiryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  // 날짜, 답변 상태
  dateStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  inquiryStatusWaiting: {
    marginTop: 4,
    color: '#005c99ff',
    marginRight: 8,
  },
  inquiryStatusAnswered: {
    marginTop: 4,
    color: '#000',
    marginRight: 8,
  },
  inquiryDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  inquiryStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inquiryDetail: {
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f2f2f2ff',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  boldLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  inquiryStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMarginLeft: {
    marginLeft: 6,
  },
  // 삭제
  delContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  space: {
    justifyContent: 'space-between',
  },
  delText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  delBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#000',
    borderRadius: 5,
    marginLeft: 10,
  },
  //없을 때
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  //문의 상세 이미지
  inquiryImage: {
    width: '100%',
    height: 200,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 8,
  },
});
