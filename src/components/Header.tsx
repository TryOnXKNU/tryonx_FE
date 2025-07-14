import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

interface HeaderProps {
  isMain?: boolean;
  title?: string;
  showRightIcons?: boolean;
  hideBackButton?: boolean;
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;

  // 드롭다운 열림 상태, 토글 함수
  categoryOpen?: boolean;
  setCategoryOpen?: (open: boolean) => void;

  // 홈
  showHomeButton?: boolean;

  //뒤로가기 다른곳으로
  // onBackPress?: () => void;
}

export default function Header({
  isMain = false,
  title,
  showRightIcons = true,
  hideBackButton = false,
  // 카테고리
  categories,
  selectedCategory,
  onSelectCategory,
  categoryOpen,
  setCategoryOpen,

  // 홈
  showHomeButton = false,
}: // 뒤로가기 다른 곳
// onBackPress,
HeaderProps) {
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
              {/* {!hideBackButton && (
                <TouchableOpacity
                  onPress={onBackPress ?? (() => navigation.goBack())}
                >
                  <Icon name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
              )} */}

              {!hideBackButton && (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Icon name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
              )}

              {categories &&
              selectedCategory &&
              onSelectCategory &&
              setCategoryOpen !== undefined ? (
                <View style={styles.dropdownWrapper}>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => {
                      setCategoryOpen(!categoryOpen);
                      // 필요하면 sortOpen 등 다른 상태 제어도 부모에서 처리
                    }}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedCategory}
                    </Text>
                    <Icon
                      name={categoryOpen ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="#333"
                    />
                  </TouchableOpacity>

                  {categoryOpen && (
                    <View style={styles.dropdownMenu}>
                      {categories.map(item => (
                        <TouchableOpacity
                          key={item}
                          style={styles.dropdownItem}
                          onPress={() => {
                            onSelectCategory(item);
                            setCategoryOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedCategory === item && styles.selectedText,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                title && <Text style={styles.title}>{title}</Text>
              )}
            </View>
          )}
        </View>

        {showRightIcons && (
          <View style={styles.headerIcons}>
            {/* {showHomeButton && (
              <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                <Icon name="home-outline" size={24} color="black" />
              </TouchableOpacity>
            )} */}

            {showHomeButton && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Main', { screen: 'Home' })}
              >
                <Icon name="home-outline" size={24} color="black" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.iconSpacing}
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
    flex: 1, // 왼쪽 영역이 가능한 공간 다 차지
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
    // width를 고정하거나 최소한의 크기로 제한해서 밀리는걸 방지
    minWidth: 120,
    justifyContent: 'flex-end',
  },
  iconSpacing: {
    marginLeft: 16,
  },
  // 카테고리
  selectedCategoryTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dropdownWrapper: {
    position: 'relative',
    marginLeft: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 10, // 기존보다 더 크게
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 1000, // 크게 줘보기
    minWidth: 120,
  },

  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#000',
    padding: 10,
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
});
