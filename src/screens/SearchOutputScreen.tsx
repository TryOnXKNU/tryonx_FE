import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore'; // zustand 상태
import axios from 'axios';
type Props = NativeStackScreenProps<RootStackParamList, 'SearchOutput'>;

interface SearchResultItem {
  productName: string;
  price: number;
  discountRate: number;
  images: { imageUrl: string }[];
}

export default function SearchOutputScreen({ route, navigation }: Props) {
  const token = useAuthStore(state => state.token);
  const { keyword } = route.params;
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  const fetchSearchResults = useCallback(
    async (searchTerm: string) => {
      try {
        setLoading(true);
        const response = await axios.get(
          'http://localhost:8080/api/v1/search',
          {
            params: { keyword: searchTerm },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.status === 200) {
          setResults(response.data);
        } else {
          throw new Error('서버 오류');
        }
      } catch (error) {
        Alert.alert('오류', '검색 결과를 불러오는 데 실패했습니다.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [token],
  ); // token이 바뀌면 이 함수도 재생성됨

  useEffect(() => {
    navigation.setOptions({ title: `"${keyword}" 검색결과` });
    fetchSearchResults(keyword);
  }, [keyword, navigation, fetchSearchResults]);

  const renderItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        Alert.alert('알림', `${item.productName} 선택됨`);
      }}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.price}>
          ₩ {item.price.toLocaleString()} ({item.discountRate}% 할인)
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`"${keyword}" 검색결과`}
        showRightIcons={false}
        hideBackButton={false}
      />

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>검색 중...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => item.productName + index}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#555' },
  emptyWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999' },
  listContainer: { padding: 16 },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  info: { justifyContent: 'center' },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  price: { fontSize: 14, color: '#888' },
});
