import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getRecentItems, Product } from '../utils/recentStorage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';

type NavigationProp = StackNavigationProp<RootStackParamList, 'RecentItem'>;

export default function RecentItemScreen() {
  const [recentItems, setRecentItems] = useState<Product[]>([]);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchRecentItems = async () => {
      const items = await getRecentItems();
      const filtered = items.filter(item => !!item?.id); // id가 존재하는 항목만 유지
      setRecentItems(filtered);
    };

    fetchRecentItems();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate('ProductDetail', { productId: Number(item.id) });
      }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toLocaleString()}원</Text>
      </View>
    </TouchableOpacity>
  );

  if (recentItems.length === 0) {
    return (
      <View style={styles.safeArea}>
        <Header
          title="최근 본 상품"
          showRightIcons={false}
          hideBackButton={false}
        />
        <View style={styles.emptyContainer}>
          <Text>최근 본 상품이 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <Header
        title="최근 본 상품"
        showRightIcons={false}
        hideBackButton={false}
      />
      <FlatList
        data={recentItems}
        keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16 },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  image: { width: 80, height: 80 },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { marginTop: 4, color: '#888' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
