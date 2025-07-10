import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const RECENT_SEARCHES_KEY = 'RECENT_SEARCHES';

  // 화면이 포커스 될 때 AsyncStorage에서 recentSearches 불러오기
  useFocusEffect(
    useCallback(() => {
      const loadRecentSearches = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
          if (jsonValue != null) {
            setRecentSearches(JSON.parse(jsonValue));
          } else {
            //setRecentSearches(['']); // 기본값
          }
        } catch (e) {
          console.error('Failed to load recent searches:', e);
        }
      };
      loadRecentSearches();
    }, []),
  );

  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    Keyboard.dismiss();

    let updatedSearches = recentSearches;
    if (!recentSearches.includes(searchTerm)) {
      updatedSearches = [searchTerm, ...recentSearches];
      setRecentSearches(updatedSearches);
      saveRecentSearches(updatedSearches);
    }

    navigation.navigate('SearchOutput', { keyword: searchTerm });

    setSearchTerm('');
  };

  const handleTagPress = (term: string) => {
    Keyboard.dismiss();

    let updatedSearches = recentSearches;
    if (!recentSearches.includes(term)) {
      updatedSearches = [term, ...recentSearches];
      setRecentSearches(updatedSearches);
      saveRecentSearches(updatedSearches);
    }

    navigation.navigate('SearchOutput', { keyword: term });
  };

  const removeSearch = (term: string) => {
    const filtered = recentSearches.filter(item => item !== term);
    setRecentSearches(filtered);
    saveRecentSearches(filtered);
  };

  // const [searchTerm, setSearchTerm] = useState('');
  // const [recentSearches, setRecentSearches] = useState([
  //   '아우터',
  //   '반팔',
  //   '운동화',
  // ]);

  // const handleSearch = () => {
  //   if (!searchTerm.trim()) return;

  //   Keyboard.dismiss();

  //   if (!recentSearches.includes(searchTerm)) {
  //     setRecentSearches([searchTerm, ...recentSearches]);
  //   }

  //   // Replace this with navigation to your SearchOutput screen
  //   navigation.navigate('SearchOutput', { keyword: searchTerm });

  //   setSearchTerm('');
  // };

  // const handleTagPress = (term: string) => {
  //   Keyboard.dismiss();

  //   if (!recentSearches.includes(term)) {
  //     setRecentSearches([term, ...recentSearches]);
  //   }

  //   navigation.navigate('SearchOutput', { keyword: term });
  // };

  // const removeSearch = (term: string) => {
  //   setRecentSearches(recentSearches.filter(item => item !== term));
  // };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <Header title="검색" showRightIcons={true} hideBackButton={false} />

      {/* 검색 입력창 */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="검색어를 입력하세요"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 최근 검색어 */}
      <View style={styles.section}>
        <Text style={styles.title}>최근 검색어</Text>
        <View style={styles.tagWrap}>
          {recentSearches.map((term, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleTagPress(term)}
              style={styles.recentTag}
              activeOpacity={0.8}
            >
              <Text style={styles.tagText}>{term}</Text>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  removeSearch(term);
                }}
              >
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 인기 검색어 */}
      <View style={styles.section}>
        <Text style={styles.title}>인기 검색어</Text>
        <View style={styles.tagWrap}>
          {['원피스', '슬랙스', '블레이저', '크롭티', '샌들'].map(
            (term, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleTagPress(term)}
                style={styles.popularTag}
              >
                <Text style={styles.popularText}>{term}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 45,
    color: '#000',
  },
  searchBtn: {
    marginLeft: 8,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  recentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  tagText: {
    color: '#000',
    marginRight: 6,
  },
  closeBtn: {
    fontSize: 14,
    color: '#888',
  },
  popularTag: {
    backgroundColor: '#000',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 10,
  },
  popularText: {
    color: '#fff',
    fontSize: 14,
  },
});
