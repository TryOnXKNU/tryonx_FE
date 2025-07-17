import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // 타입 import

import MainTabNavigator from './MainTabNavigator';
import SearchScreen from '../screens/SearchScreen';
import SearchOutputScreen from '../screens/SearchOutputScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditProfileImageScreen from '../screens/EditProfileImageScreen';
import NotificationScreen from '../screens/NotificationScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

import ReviewListScreen from '../screens/ReviewListScreen';

import MyOrderListScreen from '../screens/MyOrderListScreen';
import OrderSheetScreen from '../screens/OrderSheetScreen';
import OrderCompleteScreen from '../screens/OrderCompleteScreen';
import AskFormScreen from '../screens/AskFormScreen';

import WishlistScreen from '../screens/WishlistScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import InquiryScreen from '../screens/InquiryScreen';

import ReviewWriteScreen from '../screens/ReviewWriteScreen';
import MyReviewListScreen from '../screens/MyReviewListScreen';

import CartScreen from '../screens/CartScreen';

// 관리자
import ProductAddScreen from '../screens/admin/ProductAddScreen';

const Stack = createNativeStackNavigator<RootStackParamList>(); // 타입 적용

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchOutput" component={SearchOutputScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="EditProfileImage"
        component={EditProfileImageScreen}
      />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ReviewList" component={ReviewListScreen} />
      <Stack.Screen name="Inquiry" component={InquiryScreen} />
      <Stack.Screen name="AskForm" component={AskFormScreen} />
      <Stack.Screen name="MyOrderList" component={MyOrderListScreen} />
      <Stack.Screen name="OrderSheet" component={OrderSheetScreen} />
      <Stack.Screen name="OrderComplete" component={OrderCompleteScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />

      <Stack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
      <Stack.Screen name="MyReviewList" component={MyReviewListScreen} />

      <Stack.Screen name="Cart" component={CartScreen} />
      {/* 관리자 */}
      <Stack.Screen name="ProductAdd" component={ProductAddScreen} />
    </Stack.Navigator>
  );
}
