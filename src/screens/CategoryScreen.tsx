import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

export default function CategoryScreen() {
  const categories = [
    'NewArrival',
    'all',
    'tops',
    'dresses',
    'outerwear',
    'bottoms',
    'acc',
  ];

  // 카테고리 눌렀을 때 이동 함수 예시
  const handleCategoryPress = (category: string) => {
    console.log('카테고리 선택:', category);
    // navigation.navigate('CategoryDetail', { category });
    // 원하는 화면으로 네비게이트 추가 가능
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="카테고리" showRightIcons={true} hideBackButton={true} />

      {/* 카테고리 리스트 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map(item => (
          <TouchableOpacity
            key={item}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(item)}
          >
            <Text style={styles.categoryText}>{item.toUpperCase()}</Text>
            <Icon name="chevron-forward" size={22} color="#888" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerIcons: {
    flexDirection: 'row',
  },
  marginLeft16: {
    marginLeft: 16,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 14,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});
