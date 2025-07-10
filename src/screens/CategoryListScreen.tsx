import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../components/Header';

import { RootStackParamList } from '../navigation/types';

const categories = [
  'NewArrival',
  'all',
  'tops',
  'dresses',
  'outerwear',
  'bottoms',
  'acc',
];

const sortOptions = ['인기순', '리뷰순', '신상품순', '고가순', '저가순'];

const sampleData = [
  {
    id: '1',
    category: 'tops',
    image: 'https://picsum.photos/id/1/100',
    name: '상의 티셔츠',
    price: '12,000원',
    likes: 10,
  },
  {
    id: '2',
    category: 'bottoms',
    image: 'https://picsum.photos/id/2/100',
    name: '청바지',
    price: '25,000원',
    likes: 8,
  },
  {
    id: '3',
    category: 'outerwear',
    image: 'https://picsum.photos/id/3/100',
    name: '자켓',
    price: '35,000원',
    likes: 15,
  },
  {
    id: '4',
    category: 'dresses',
    image: 'https://picsum.photos/id/4/100',
    name: '원피스',
    price: '28,000원',
    likes: 12,
  },
  {
    id: '5',
    category: 'acc',
    image: 'https://picsum.photos/id/5/100',
    name: '가방',
    price: '18,000원',
    likes: 5,
  },
  {
    id: '6',
    category: 'tops',
    image: 'https://picsum.photos/id/6/100',
    name: '셔츠',
    price: '15,000원',
    likes: 9,
  },
  {
    id: '7',
    category: 'bottoms',
    image: 'https://picsum.photos/id/7/100',
    name: '슬랙스',
    price: '22,000원',
    likes: 6,
  },
  {
    id: '8',
    category: 'acc',
    image: 'https://picsum.photos/id/8/100',
    name: '모자',
    price: '9,000원',
    likes: 4,
  },
  {
    id: '9',
    category: 'NewArrival',
    image: 'https://picsum.photos/id/9/100',
    name: '신상 자켓',
    price: '39,000원',
    likes: 11,
  },
];

type CategoryListScreenRouteProp = RouteProp<
  RootStackParamList,
  'CategoryList'
>;

export default function CategoryListScreen() {
  const route = useRoute<CategoryListScreenRouteProp>();
  const { selectedCategory: initialCategory } = route.params || {};

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || 'all',
  );
  const [selectedSort, setSelectedSort] = useState('인기순');

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  //   const filteredData =
  //     selectedCategory === 'all'
  //       ? sampleData
  //       : sampleData.filter(item => item.category === selectedCategory);

  const filteredAndSortedData = () => {
    const data =
      selectedCategory === 'all'
        ? sampleData
        : sampleData.filter(item => item.category === selectedCategory);

    switch (selectedSort) {
      case '인기순':
        return [...data].sort((a, b) => b.likes - a.likes);
      case '리뷰순':
        return [...data]; // 리뷰 데이터가 없으므로 우선 그대로
      case '신상품순':
        return [...data].sort((a, b) => Number(b.id) - Number(a.id)); // ID를 기준으로 간단히
      case '고가순':
        return [...data].sort(
          (a, b) =>
            parseInt(b.price.replace(/[^0-9]/g, ''), 10) -
            parseInt(a.price.replace(/[^0-9]/g, ''), 10),
        );
      case '저가순':
        return [...data].sort(
          (a, b) =>
            parseInt(a.price.replace(/[^0-9]/g, ''), 10) -
            parseInt(b.price.replace(/[^0-9]/g, ''), 10),
        );
      default:
        return data;
    }
  };
  const renderItem = ({ item }: { item: (typeof sampleData)[0] }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      style={styles.itemContainer}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
      <View style={styles.likesRow}>
        <Icon name="heart" size={14} color="#e74c3c" />
        <Text style={styles.likesText}>{item.likes}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.safeArea}>
      <View
        style={[
          styles.headerWrapper,
          (categoryOpen || sortOpen) && styles.headerWrapperVisible,
        ]}
      >
        <Header
          title="카테고리"
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryOpen={categoryOpen}
          setCategoryOpen={setCategoryOpen}
          hideBackButton={false}
        />
      </View>

      <View style={styles.dropdownContainer}>
        {/* 정렬 드롭다운 */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setSortOpen(prev => !prev);
              setCategoryOpen(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>{selectedSort}</Text>
            <Icon
              name={sortOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#333"
            />
          </TouchableOpacity>

          {sortOpen && (
            <View style={styles.dropdownMenu}>
              {sortOptions.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSort(item);
                    setSortOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedSort === item && styles.selectedText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredAndSortedData()}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'visible', // 드롭다운 가려짐 방지용
  },

  headerWrapper: {
    zIndex: 10,
    backgroundColor: '#fff',
  },

  headerWrapperVisible: {
    zIndex: 1000,
    overflow: 'visible',
  },

  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  dropdownWrapper: {
    flex: 1,
    marginHorizontal: 4,
    position: 'relative', // 기준점 설정
    zIndex: 100,
  },

  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },

  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
  },

  dropdownMenu: {
    position: 'absolute', // 레이아웃에서 분리
    top: '100%', // 버튼 아래쪽에 붙게
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // alignSelf: 'flex-end',
    // minWidth: 120,
    // maxWidth: 200,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },

  selectedText: {
    fontWeight: 'bold',
    color: '#000',
  },

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
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
  },
  likesText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#e74c3c',
  },
});
