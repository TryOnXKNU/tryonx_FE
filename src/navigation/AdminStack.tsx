import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';

// 하단탭
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManageScreen from '../screens/admin/UserManageScreen';
import ProductManageScreen from '../screens/admin/ProductManageScreen';
import OrderManageScreen from '../screens/admin/OrderManageScreen';
import InquiryManageScreen from '../screens/admin/InquiryManageScreen';

import ProductAddScreen from '../screens/admin/ProductAddScreen';
import MemberDetailScreen from '../screens/admin/MemberDetailScreen';
import MemberOrdersScreen from '../screens/admin/MemberOrdersScreen';

import AdminExchangeListScreen from '../screens/admin/AdminExchangeListScreen';
import AdminReturnListScreen from '../screens/admin/AdminReturnListScreen';

import { AdminStackParamList } from '../navigation/types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

//const Stack = createNativeStackNavigator();

function AdminTabs() {
  return (
    <MainTabNavigator
      tabs={[
        {
          name: 'Users',
          component: UserManageScreen,
          label: '회원관리',
          icon: 'people-outline',
        },
        {
          name: 'Products',
          component: ProductManageScreen,
          label: '상품관리',
          icon: 'cube-outline',
        },
        {
          name: 'Dashboard',
          component: AdminHomeScreen,
          label: '홈',
          icon: 'home-outline',
        },
        {
          name: 'Orders',
          component: OrderManageScreen,
          label: '주문관리',
          icon: 'cart-outline',
        },
        {
          name: 'Inquiries',
          component: InquiryManageScreen,
          label: '문의관리',
          icon: 'chatbubble-ellipses-outline',
        },
      ]}
      theme={{
        activeColor: '#D32F2F',
        inactiveColor: '#777',
        backgroundColor: '#fff',
      }}
    />
  );
}

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="OrderManage" component={OrderManageScreen} />
      <Stack.Screen name="InquiryManage" component={InquiryManageScreen} />
      <Stack.Screen name="ProductAdd" component={ProductAddScreen} />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
      <Stack.Screen name="MemberOrders" component={MemberOrdersScreen} />
      <Stack.Screen
        name="AdminExchangeList"
        component={AdminExchangeListScreen}
      />
      <Stack.Screen name="AdminReturnList" component={AdminReturnListScreen} />
    </Stack.Navigator>
  );
}
