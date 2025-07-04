import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import FittingScreen from '../screens/FittingScreen';
import WishlistScreen from '../screens/WishlistScreen';
import MyPageScreen from '../screens/MyPageScreen';

type TabParamList = {
  Home: undefined;
  Category: undefined;
  Fitting: undefined;
  Wishlist: undefined;
  MyPage: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const getIconName = (routeName: keyof TabParamList): string => {
  switch (routeName) {
    case 'Home':
      return 'home-outline';
    case 'Category':
      return 'grid-outline';
    case 'Fitting':
      return 'body-outline';
    case 'Wishlist':
      return 'heart-outline';
    case 'MyPage':
      return 'person-outline';
    default:
      return 'ellipse-outline';
  }
};

const screenOptions = ({
  route,
}: {
  route: RouteProp<TabParamList, keyof TabParamList>;
}): BottomTabNavigationOptions => {
  const iconName = getIconName(route.name);

  return {
    headerShown: false,
    tabBarActiveTintColor: '#000',
    tabBarInactiveTintColor: '#aaa',
    tabBarStyle: styles.tabBar,
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarIcon: ({ color, size }) => (
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={size} color={color} />
      </View>
    ),
  };
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Category"
        component={CategoryScreen}
        options={{ tabBarLabel: '카테고리' }}
      />
      <Tab.Screen
        name="Fitting"
        component={FittingScreen}
        options={{ tabBarLabel: 'AI피팅' }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarLabel: '좋아요' }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{ tabBarLabel: '마이페이지' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    height: 86,
    paddingBottom: 10,
    paddingTop: 5,
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6, // 라벨을 아이콘에서 좀 더 떨어뜨림
  },
  iconContainer: {
    marginBottom: 4, // 아이콘과 라벨 간격 조절용 공간 확보
    alignItems: 'center',
  },
});
