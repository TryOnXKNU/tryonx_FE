import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';
import { RootStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type WishlistScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Wishlist'
>;

type LikeItem = {
  productId: number;
  productName: string;
  imageUrl: string;
  liked: boolean; // 좋아요 상태
};

const SERVER_URL = 'http://localhost:8080';

export default function WishlistScreen() {
  const navigation = useNavigation<WishlistScreenNavigationProp>();
  const token = useAuthStore(state => state.token);

  const [wishlistData, setWishlistData] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async (productId: number) => {
    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/v1/${productId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { liked } = response.data;

      setWishlistData(prev => {
        if (liked) {
          // 좋아요가 켜진 경우 liked만 업데이트
          return prev.map(item =>
            item.productId === productId ? { ...item, liked } : item,
          );
        } else {
          // 좋아요가 꺼진 경우 해당 아이템 목록에서 제거
          return prev.filter(item => item.productId !== productId);
        }
      });
    } catch (err) {
      console.error(err);
      setError('좋아요를 변경하는데 실패했습니다.');
    }
  };

  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setError('로그인이 필요합니다.');
      setWishlistData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<LikeItem[]>(
        `${SERVER_URL}/api/v1/likes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setWishlistData(response.data);
    } catch (err) {
      console.error(err);
      setError('좋아요 목록을 불러오는데 실패했습니다.');
      setWishlistData([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist]),
  );

  const renderItem = ({ item }: { item: LikeItem }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ProductDetail', { productId: item.productId })
      }
      style={styles.itemContainer}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: SERVER_URL + item.imageUrl }}
          style={styles.itemImage}
        />

        {/* 하트 터치 시 상품 전체 터치 이벤트가 발생하지 않도록 TouchableOpacity 분리 */}
        <TouchableOpacity
          style={styles.heartIconWrapper}
          onPress={() => toggleLike(item.productId)}
          activeOpacity={0.7}
        >
          <Icon name="heart" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
      <Text style={styles.itemName} numberOfLines={1}>
        {item.productName}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Header title="좋아요" showRightIcons={true} hideBackButton={true} />

      {error ? (
        <View style={styles.emptyWrapper}>
          <Text>{error}</Text>
        </View>
      ) : wishlistData.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>좋아요한 상품이 없습니다.</Text>
            <Text style={styles.emptySubtitle}>
              마음에 드는 상품을 좋아요 눌러보세요.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Category' as never)}
          >
            <Text style={styles.buttonText}>상품보러가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistData}
          renderItem={renderItem}
          keyExtractor={item => item.productId.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

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
  imageWrapper: {
    position: 'relative',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 6, // 텍스트랑 간격 조금 줄임
  },
  heartIconWrapper: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  itemName: {
    marginTop: 3,
    paddingLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    alignSelf: 'stretch',
    textAlign: 'left',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
  },

  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyContainer: {
    width: 350,
    height: 320,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fafafa',
    marginBottom: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },

  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
