import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchOutput'>;

interface SearchResultItem {
  productId: number;
  productName: string;
  price: number;
  discountRate: number;
  likeCount?: number;
  images: { imageUrl: string }[];
}

const SERVER_URL = 'http://localhost:8080';

export default function SearchOutputScreen({ route, navigation }: Props) {
  const token = useAuthStore(state => state.token);
  const { keyword } = route.params;
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  const fetchSearchResults = useCallback(
    async (searchTerm: string) => {
      try {
        setLoading(true);
        const response = await axios.get(`${SERVER_URL}/api/v1/search`, {
          params: { keyword: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
        });

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
  );

  useEffect(() => {
    navigation.setOptions({ title: `"${keyword}" 검색결과` });
    fetchSearchResults(keyword);
  }, [keyword, navigation, fetchSearchResults]);

  useFocusEffect(
    useCallback(() => {
      fetchSearchResults(keyword);
    }, [keyword, fetchSearchResults]),
  );

  const renderItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('ProductDetail', { productId: item.productId })
      }
    >
      <Image
        source={{
          uri:
            item.images && item.images.length > 0
              ? encodeURI(`${SERVER_URL}${item.images[0].imageUrl}`)
              : 'https://via.placeholder.com/100',
        }}
        style={styles.itemImage}
      />
      <Text style={styles.itemName} numberOfLines={1}>
        {item.productName}
      </Text>
      <Text style={styles.itemPrice}>
        ₩ {item.price.toLocaleString()} ({item.discountRate}% 할인)
      </Text>
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
          keyExtractor={item => item.productId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          numColumns={3}
          showsVerticalScrollIndicator={false}
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
  listContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 32,
  },
  itemContainer: {
    flex: 1 / 3,
    marginHorizontal: 13,
    marginBottom: 24,
    alignItems: 'center',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  itemPrice: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    alignSelf: 'stretch',
    textAlign: 'left',
  },
});
