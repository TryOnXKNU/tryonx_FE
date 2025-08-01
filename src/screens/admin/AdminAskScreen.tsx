import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';

import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

const SERVER_URL = 'http://localhost:8080';
const Tab = createMaterialTopTabNavigator();

export default function AdminAskScreen() {
  return (
    <View style={styles.container}>
      <Header title="문의 관리" showRightIcons={false} hideBackButton={false} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#111827',
          tabBarIndicatorStyle: { backgroundColor: '#111827' },
          tabBarLabelStyle: { fontWeight: '700', fontSize: 14 },
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        <Tab.Screen name="NEW" component={NewInquiryTab} />
        <Tab.Screen name="답변 완료" component={CompletedInquiryTab} />
      </Tab.Navigator>
    </View>
  );
}

// 타입 정의
type InquiryItem = {
  askId: number;
  title: string;
  productName: string;
  size: string;
  imgUrl: string;
  answer?: string;
};

// NEW 탭
function NewInquiryTab() {
  const token = useAuthStore(state => state.token);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<AdminStackParamList, 'AdminAsk'>>();

  const fetchNewInquiries = useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/v1/admin/asks/new`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries(res.data);
    } catch (err) {
      Alert.alert('오류', 'NEW 문의를 불러오는 데 실패했습니다.');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchNewInquiries();
    }, [fetchNewInquiries]),
  );

  // 답변 등록 페이지로 이동
  const goToAnswerScreen = (item: InquiryItem) => {
    navigation.navigate('AdminAnswer', {
      askId: item.askId,
      title: item.title,
    });
  };

  const renderItem = ({ item }: { item: InquiryItem }) => (
    <TouchableOpacity
      style={styles.itemBox}
      onPress={() => goToAnswerScreen(item)}
    >
      <Image
        source={{ uri: `${SERVER_URL}${item.imgUrl}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemText}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>
          {item.productName} / {item.size}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#000" />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={inquiries}
      keyExtractor={item => `new-${item.askId}`}
      renderItem={renderItem}
      contentContainerStyle={
        inquiries.length === 0 ? styles.emptyContainer : styles.listContainer
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>NEW 문의가 없습니다.</Text>
      }
    />
  );
}

// 답변완료 탭
function CompletedInquiryTab() {
  const token = useAuthStore(state => state.token);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<AdminStackParamList, 'AdminAsk'>>();

  const fetchCompletedInquiries = useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/v1/admin/asks/completed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // 최근 것을 위로 (askId가 클수록 최신)
      const sortedData = res.data.sort(
        (a: InquiryItem, b: InquiryItem) => b.askId - a.askId,
      );

      setInquiries(sortedData);
    } catch (err) {
      Alert.alert('오류', '답변완료 문의를 불러오는 데 실패했습니다.');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchCompletedInquiries();
    }, [fetchCompletedInquiries]),
  );

  const renderItem = ({ item }: { item: InquiryItem }) => (
    <TouchableOpacity
      style={styles.itemBox}
      onPress={() =>
        navigation.navigate('AdminAskDetail', { askId: item.askId })
      }
    >
      <Image
        source={{ uri: `${SERVER_URL}${item.imgUrl}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemText}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>
          {item.productName} / {item.size}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#000" />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={inquiries}
      keyExtractor={item => `completed-${item.askId}`}
      renderItem={renderItem}
      contentContainerStyle={
        inquiries.length === 0 ? styles.emptyContainer : styles.listContainer
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>답변 완료된 문의가 없습니다.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContainer: { padding: 16 },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});
