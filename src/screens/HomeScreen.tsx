import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import Header from '../components/Header';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  return (
    <View style={styles.container}>
      <Header isMain={true} showRightIcons={true} hideBackButton={true} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 검색창 */}
        <TouchableOpacity style={styles.searchBox} onPress={handleSearchPress}>
          <Text style={styles.searchText}>검색어를 입력하세요</Text>
        </TouchableOpacity>

        {/* 인기 많은 스타일 */}
        <Text style={styles.sectionTitle}>인기 많은 스타일</Text>
        <View style={styles.itemRow}>
          <ItemBox name="아이템 1" />
          <ItemBox name="아이템 2" />
          <ItemBox name="아이템 3" />
        </View>

        {/* 비슷한 스타일 추천 */}
        <Text style={styles.sectionTitle}>비슷한 스타일 추천</Text>
        <View style={styles.itemRow}>
          <ItemBox name="추천 1" />
          <ItemBox name="추천 2" />
          <ItemBox name="추천 3" />
        </View>

        {/* 관심 스타일 */}
        <Text style={styles.sectionTitle}>나의 관심 스타일 선택하기</Text>
        <View style={styles.styleTags}>
          {['심플', '캐주얼', '러블리', '빈티지'].map(tag => (
            <TouchableOpacity key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default HomeScreen;

function ItemBox({ name }: { name: string }) {
  return (
    <View style={styles.itemBox}>
      <Text style={styles.itemBoxText}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 100 },
  searchBox: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  searchText: { color: '#888' },
  banner: {
    width: '100%',
    height: 180,
    backgroundColor: '#ddd',
    marginBottom: 24,
    borderRadius: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  itemBox: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  itemBoxText: { fontSize: 14 },
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
