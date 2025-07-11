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
import QaListScreen from '../screens/QaListScreen';
import ReviewListScreen from '../screens/ReviewListScreen';

import MyOrderListScreen from '../screens/MyOrderListScreen';
import OrderSheetScreen from '../screens/OrderSheetScreen';
import OrderCompleteScreen from '../screens/OrderCompleteScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';

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
      <Stack.Screen name="QaList" component={QaListScreen} />
      <Stack.Screen name="ReviewList" component={ReviewListScreen} />

      <Stack.Screen name="MyOrderList" component={MyOrderListScreen} />
      <Stack.Screen name="OrderSheet" component={OrderSheetScreen} />
      <Stack.Screen name="OrderComplete" component={OrderCompleteScreen} />

      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}
