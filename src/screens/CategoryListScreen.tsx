import React, { useState } from 'react'; // useEffect 추가
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import axios from 'axios';
import { RootStackParamList } from '../navigation/types';

type Product = {
  productId: number;
  productName: string;
  productPrice: number;
  likeCount: number;
  categoryId: number;
  thumbnailUrl: string;
};

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

type CategoryListScreenRouteProp = RouteProp<
  RootStackParamList,
  'CategoryList'
>;

export default function CategoryListScreen() {
  const token = useAuthStore(state => state.token);
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

  // 상태 추가
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const SERVER_URL = 'http://localhost:8080';

  useFocusEffect(
    React.useCallback(() => {
      if (!token) return;

      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await axios.get<Product[]>(
            `${SERVER_URL}/api/v1/products`,
            {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000,
            },
          );
          setProducts(response.data);
        } catch (error) {
          console.error('Fetch error:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }, [token]),
  );
  // useEffect(() => {
  //   if (!token) return;

  //   async function fetchProducts() {
  //     setLoading(true);
  //     try {
  //       const response = await axios.get<Product[]>(
  //         `${SERVER_URL}/api/v1/products`,
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //           timeout: 10000,
  //         },
  //       );
  //       setProducts(response.data);
  //     } catch (error) {
  //       console.error('Fetch error:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchProducts();
  // }, [token]);

  const filteredAndSortedData = () => {
    let data =
      selectedCategory === 'all'
        ? products
        : products.filter(item => {
            switch (selectedCategory) {
              case 'tops':
                return item.categoryId === 1;
              case 'bottoms':
                return item.categoryId === 2;
              case 'outerwear':
                return item.categoryId === 3;
              case 'dresses':
                return item.categoryId === 4;
              case 'acc':
                return item.categoryId >= 5 && item.categoryId <= 15;
              case 'NewArrival':
                // 임시로 전체 리턴
                return true;
              default:
                return false;
            }
          });

    switch (selectedSort) {
      case '인기순':
        return [...data].sort((a, b) => b.likeCount - a.likeCount);
      case '리뷰순':
        return [...data]; // 리뷰 데이터 없으면 그대로
      case '신상품순':
        return [...data].sort((a, b) => b.productId - a.productId);
      case '고가순':
        return [...data].sort((a, b) => b.productPrice - a.productPrice);
      case '저가순':
        return [...data].sort((a, b) => a.productPrice - b.productPrice);
      default:
        return data;
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      //onPress={() => navigation.navigate('ProductDetail', { product: item })}
      onPress={() =>
        navigation.navigate('ProductDetail', { productId: item.productId })
      }
      style={styles.itemContainer}
    >
      <Image
        source={{
          uri: item.thumbnailUrl.startsWith('http')
            ? item.thumbnailUrl
            : encodeURI(`${SERVER_URL}${item.thumbnailUrl}`),
        }}
        style={styles.itemImage}
      />
      <Text style={styles.itemName} numberOfLines={1}>
        {item.productName}
      </Text>
      <Text style={styles.itemPrice}>
        {item.productPrice.toLocaleString()}원
      </Text>
      <View style={styles.likesRow}>
        <Icon name="heart" size={14} color="#e74c3c" />
        <Text style={styles.likesText}>{item.likeCount}</Text>
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
        keyExtractor={item => item.productId.toString()}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? <Text>Loading...</Text> : <Text>상품이 없습니다.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'visible',
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
    position: 'relative',
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
    position: 'absolute',
    top: '100%',
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
