import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const screenWidth = Dimensions.get('window').width;
  const bannerWidthPadding = 32; // content padding 좌우 합계
  const [bannerWidth, setBannerWidth] = useState<number>(
    screenWidth - bannerWidthPadding,
  );
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const bannerImages = [
    require('../assets/images/logo.png'),
    require('../assets/images/banner1.png'),
    require('../assets/images/banner2.png'),
  ];

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (bannerIndex + 1) % bannerImages.length;
      setBannerIndex(next);
      bannerRef.current?.scrollTo({
        x: next * bannerWidth,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerIndex, bannerWidth, bannerImages.length]);

  return (
    <View style={styles.container}>
      <Header isMain={true} showRightIcons={true} hideBackButton={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 검색창 */}
        <TouchableOpacity style={styles.searchBox} onPress={handleSearchPress}>
          <Icon name="search" size={18} color="#9CA3AF" />
          <Text style={styles.searchText}>검색어를 입력하세요</Text>
        </TouchableOpacity>

        {/* 배너 슬라이더 */}
        <View
          style={styles.bannerWrapper}
          onLayout={e => setBannerWidth(e.nativeEvent.layout.width)}
        >
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {bannerImages.map((img, idx) => (
              <Image
                key={idx}
                source={img}
                style={[styles.bannerImage, { width: bannerWidth }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.dotsRow}>
            {bannerImages.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === bannerIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* 인기 많은 스타일 */}
        <Text style={styles.sectionTitle}>인기 많은 스타일</Text>
        <ItemGrid
          names={[
            '아이템 1',
            '아이템 2',
            '아이템 3',
            '아이템 4',
            '아이템 5',
            '아이템 6',
          ]}
        />

        {/* 비슷한 스타일 추천 */}
        <Text style={styles.sectionTitle}>비슷한 스타일 추천</Text>
        <ItemGrid
          names={['추천 1', '추천 2', '추천 3', '추천 4', '추천 5', '추천 6']}
        />
      </ScrollView>
    </View>
  );
}

export default HomeScreen;

function ItemBox({ name }: { name: string }) {
  return (
    <View style={styles.itemBox}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <Text style={styles.itemBoxText} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function ItemGrid({ names }: { names: string[] }) {
  return (
    <View style={styles.gridWrap}>
      {names.map((n, i) => (
        <View key={`${n}-${i}`} style={styles.gridItem}>
          <ItemBox name={n} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 100 },
  searchBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchText: { color: '#9CA3AF', fontSize: 14 },
  bannerWrapper: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  bannerImage: {
    height: 180,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd' },
  dotActive: { backgroundColor: '#111' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  gridItem: { width: '31%' },
  itemBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemImage: { width: '100%', height: 100, backgroundColor: '#F3F4F6' },
  itemBoxText: {
    fontSize: 13,
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: '#111',
  },
  styleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: '#fff' },
});
