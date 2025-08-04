import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // 타입 import

//import MainTabNavigator from './MainTabNavigator';
import UserMainStack from './UserMainStack';
import SearchScreen from '../screens/SearchScreen';
import SearchOutputScreen from '../screens/SearchOutputScreen';
import EditProfileImageScreen from '../screens/EditProfileImageScreen';

import MyProfileScreen from '../screens/MyProfileScreen';
import PointHistoryScreen from '../screens/PointHistoryScreen';

import EditNicknameScreen from '../screens/EditNicknameScreen';
import EditAddressScreen from '../screens/EditAddressScreen';
import EditPasswordScreen from '../screens/EditPasswordScreen';
import EditBodyInfoScreen from '../screens/EditBodyInfoScreen';

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
import RecentItemScreen from '../screens/RecentItemScreen';

import CartScreen from '../screens/CartScreen';

import ExchangeRequestScreen from '../screens/ExchangeRequestScreen';
import ExchangeListScreen from '../screens/ExchangeListScreen';
import ExchangeDetailScreen from '../screens/ExchangeDetailScreen';

import ReturnRequestScreen from '../screens/ReturnRequestScreen';
import ReturnListScreen from '../screens/ReturnListScreen';
import ReturnDetailScreen from '../screens/ReturnDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>(); // 타입 적용

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={UserMainStack} />

      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SearchOutput" component={SearchOutputScreen} />

      <Stack.Screen
        name="EditProfileImage"
        component={EditProfileImageScreen}
      />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="PointHistory" component={PointHistoryScreen} />

      <Stack.Screen name="EditNickname" component={EditNicknameScreen} />
      <Stack.Screen name="EditAddress" component={EditAddressScreen} />
      <Stack.Screen name="EditPassword" component={EditPasswordScreen} />
      <Stack.Screen name="EditBodyInfo" component={EditBodyInfoScreen} />

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
      <Stack.Screen name="RecentItem" component={RecentItemScreen} />

      <Stack.Screen name="ExchangeRequest" component={ExchangeRequestScreen} />
      <Stack.Screen name="ExchangeList" component={ExchangeListScreen} />
      <Stack.Screen name="ExchangeDetail" component={ExchangeDetailScreen} />

      <Stack.Screen name="ReturnRequest" component={ReturnRequestScreen} />
      <Stack.Screen name="ReturnList" component={ReturnListScreen} />
      <Stack.Screen name="ReturnDetail" component={ReturnDetailScreen} />

      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
}
