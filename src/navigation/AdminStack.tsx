import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';

// 하단탭
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import UserManageScreen from '../screens/admin/UserManageScreen';
import ProductManageScreen from '../screens/admin/ProductManageScreen';

import OrderManageScreen from '../screens/admin/OrderManageScreen';
import AdminOrderDetailScreen from '../screens/admin/AdminOrderDetailScreen';

import AdminAskScreen from '../screens/admin/AdminAskScreen';

import RecentMembersScreen from '../screens/admin/RecentMembersScreen';
import AllMembersScreen from '../screens/admin/AllMembersScreen';

import AdminProductDetailScreen from '../screens/admin/AdminProductDetailScreen';
import ProductAddScreen from '../screens/admin/ProductAddScreen';
import ProductAddImageScreen from '../screens/admin/ProductAddImageScreen';
import AdminProductEditScreen from '../screens/admin/AdminProductEditScreen';

import MemberDetailScreen from '../screens/admin/MemberDetailScreen';
import MemberOrdersScreen from '../screens/admin/MemberOrdersScreen';

import AdminAskDetailScreen from '../screens/admin/AdminAskDetailScreen';
import AAdminAnswerScreen from '../screens/admin/AdminAnswerScreen';

import AdminExchangeListScreen from '../screens/admin/AdminExchangeListScreen';
import AdminExchangeDetailScreen from '../screens/admin/AdminExchangeDetailScreen';

import AdminReturnListScreen from '../screens/admin/AdminReturnListScreen';
import AdminReturnDetailScreen from '../screens/admin/AdminReturnDetailScreen';

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
          component: AdminAskScreen,
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

      <Stack.Screen name="ProductManage" component={ProductManageScreen} />
      <Stack.Screen name="RecentMembers" component={RecentMembersScreen} />
      <Stack.Screen name="AllMembers" component={AllMembersScreen} />

      <Stack.Screen name="OrderManage" component={OrderManageScreen} />
      <Stack.Screen
        name="AdminOrderDetail"
        component={AdminOrderDetailScreen}
      />

      <Stack.Screen name="AdminAsk" component={AdminAskScreen} />
      <Stack.Screen
        name="AdminProductDetail"
        component={AdminProductDetailScreen}
      />
      <Stack.Screen name="ProductAdd" component={ProductAddScreen} />
      <Stack.Screen name="ProductAddImage" component={ProductAddImageScreen} />
      <Stack.Screen
        name="AdminProductEdit"
        component={AdminProductEditScreen}
      />
      <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
      <Stack.Screen name="MemberOrders" component={MemberOrdersScreen} />
      <Stack.Screen
        name="AdminExchangeList"
        component={AdminExchangeListScreen}
      />
      <Stack.Screen
        name="AdminExchangeDetail"
        component={AdminExchangeDetailScreen}
      />
      <Stack.Screen name="AdminReturnList" component={AdminReturnListScreen} />
      <Stack.Screen
        name="AdminReturnDetail"
        component={AdminReturnDetailScreen}
      />
      <Stack.Screen name="AdminAskDetail" component={AdminAskDetailScreen} />
      <Stack.Screen name="AdminAnswer" component={AAdminAnswerScreen} />
    </Stack.Navigator>
  );
}
