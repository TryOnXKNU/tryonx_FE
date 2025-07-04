import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

const tabs = [
  { name: '카테고리', icon: 'grid-outline' },
  { name: 'AI피팅', icon: 'construct-outline' },
  { name: '홈', icon: 'home-outline' },
  { name: '찜', icon: 'heart-outline' },
  { name: '마이페이지', icon: 'person-outline' },
];

export default function BottomTabBar() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleTabPress = (tabName: string) => {
    switch (tabName) {
      case '홈':
        navigation.navigate('Home');
        break;
      case '마이페이지':
        navigation.navigate('MyPage');
        break;
      // 필요 시 다른 탭도 추가 가능
      default:
        console.log(`${tabName} 탭 클릭됨`);
    }
  };

  return (
    <View style={styles.bottomTab}>
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={i}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab.name)}
          activeOpacity={0.7}
        >
          <Icon name={tab.icon} size={24} color="#333" style={styles.icon} />
          <Text style={styles.tabText}>{tab.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginBottom: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  icon: {
    marginBottom: 8,
  },
  tabText: {
    fontSize: 13,
    color: '#333',
  },
});
