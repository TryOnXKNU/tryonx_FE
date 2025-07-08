import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

interface HeaderProps {
  isMain?: boolean; // 메인 페이지 여부
  title?: string; // 페이지 제목
  showRightIcons?: boolean; // 오른쪽 알림/장바구니 아이콘 표시 여부
  hideBackButton?: boolean;
}

export default function Header({
  isMain = false,
  title,
  showRightIcons = true,
  hideBackButton = false, // 기본 false
}: HeaderProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView
      style={styles.headerContainer}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <View style={styles.left}>
          {isMain ? (
            <Image
              source={require('../assets/images/headerLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.backWrapper}>
              {!hideBackButton && (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Icon name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
              )}
              {title && <Text style={styles.title}>{title}</Text>}
            </View>
          )}
        </View>

        {showRightIcons && (
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notification')}
            >
              <Icon name="notifications-outline" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconSpacing}>
              <Icon name="cart-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconSpacing: {
    marginLeft: 16,
  },
});
