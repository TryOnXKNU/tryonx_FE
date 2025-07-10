import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, RouteProp } from '@react-navigation/native';
import Header from '../components/Header';
import { RootStackParamList } from '../navigation/types';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailRouteProp>();
  const { product } = route.params;

  const imageUrl = product.thumbnailUrl.startsWith('http')
    ? product.thumbnailUrl
    : `http://192.168.0.100:8080${product.thumbnailUrl}`; // IP 변경 필요

  return (
    <View style={{ flex: 1 }}>
      <Header showRightIcons={true} hideBackButton={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.infoSection}>
          <Text style={styles.name}>{product.productName}</Text>
          <Text style={styles.price}>
            {product.productPrice.toLocaleString()}원
          </Text>
          <View style={styles.likesRow}>
            <Icon name="heart" size={16} color="#e74c3c" />
            <Text style={styles.likesText}>{product.likeCount} 좋아요</Text>
          </View>
          {/* 추가 정보나 버튼 등 여기 추가 가능 */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  image: { width: '100%', height: 300, borderRadius: 12, marginBottom: 16 },
  infoSection: { paddingHorizontal: 4 },
  name: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#333' },
  likesRow: { flexDirection: 'row', alignItems: 'center' },
  likesText: { marginLeft: 6, fontSize: 16, color: '#e74c3c' },
});
