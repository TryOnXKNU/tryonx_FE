import React, { useEffect, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'SearchOutput'>;

interface SearchResultItem {
  id: string;
  name: string;
  // 필요하면 다른 필드 추가
}

export default function SearchOutputScreen({ route, navigation }: Props) {
  const { keyword } = route.params;
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    navigation.setOptions({ title: `"${keyword}" 검색결과` });
    fetchSearchResults(keyword);
  }, [keyword, navigation]);

  const fetchSearchResults = async (searchTerm: string) => {
    setLoading(true);

    // TODO: 실제 API 호출 부분. 예시로 setTimeout으로 대체
    setTimeout(() => {
      // 예시 데이터
      const fakeResults = [
        { id: '1', name: `${searchTerm} 아이템 1` },
        { id: '2', name: `${searchTerm} 아이템 2` },
        { id: '3', name: `${searchTerm} 아이템 3` },
      ];
      setResults(fakeResults);
      setLoading(false);
    }, 1000);
  };

  const renderItem = ({ item }: { item: SearchResultItem }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        // 클릭 시 상세페이지 이동 등 필요시 구현
        Alert.alert('알림', `${item.name} 선택됨`);
      }}
    >
      <Text style={styles.itemText}>{item.name}</Text>
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
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
});
