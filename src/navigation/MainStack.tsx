import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types'; // 타입 import

import MainTabNavigator from './MainTabNavigator';
import SearchScreen from '../screens/SearchScreen';
import SearchOutputScreen from '../screens/SearchOutputScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditProfileImageScreen from '../screens/EditProfileImageScreen';
import NotificationScreen from '../screens/NotificationScreen';

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
    </Stack.Navigator>
  );
}
