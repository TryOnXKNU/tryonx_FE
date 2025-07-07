import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
const sampleData = [
  {
    id: '1',
    image: 'https://picsum.photos/100',
    name: '상품명1',
    price: '12,000원',
    likes: 10,
  },
  {
    id: '2',
    image: 'https://picsum.photos/104',
    name: '상품명2',
    price: '15,000원',
    likes: 5,
  },
  {
    id: '3',
    image: 'https://picsum.photos/120',
    name: '상품명3',
    price: '20,000원',
    likes: 2,
  },
];

// 좋아요가 없을 때는 빈 배열로 바꾸면 확인 가능
const wishlistData = sampleData; // [] 빈 배열로 테스트

export default function WishlistScreen() {
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: (typeof sampleData)[0] }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <Text style={styles.itemName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.itemPrice}>{item.price}</Text>
      <View style={styles.likesRow}>
        <Icon name="heart" size={14} color="#e74c3c" />
        <Text style={styles.likesText}>{item.likes}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <Header title="좋아요" showRightIcons={true} hideBackButton={true} />

      {wishlistData.length === 0 ? (
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
          keyExtractor={item => item.id}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginLeft16: {
    marginLeft: 16,
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
    alignSelf: 'stretch', // 전체 가로 폭 차지
    textAlign: 'left', // 왼쪽 정렬
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
    justifyContent: 'flex-start', // 왼쪽 정렬
  },
  likesText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#e74c3c',
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
    fontSize: 18, // 글씨도 좀 더 크게
  },
});
