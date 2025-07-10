import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { RootStackParamList } from '../navigation/types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header showRightIcons={true} hideBackButton={false} />

      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: product.image }} style={styles.image} />

        <View style={styles.infoSection}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price}</Text>

          <View style={styles.likesRow}>
            <Icon name="heart" size={16} color="#e74c3c" />
            <Text style={styles.likesText}>{product.likes} 좋아요</Text>
          </View>

          <Text style={styles.description}>
            이 상품은 고품질의 재료로 제작되어 스타일과 편안함을 모두 갖춘
            제품입니다.
          </Text>

          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>구매하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 16,
  },
  infoSection: {
    paddingHorizontal: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 8,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  likesText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#e74c3c',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    lineHeight: 20,
  },
  buyButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
