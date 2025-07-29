import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  Modal,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

const SERVER_URL = 'http://localhost:8080';
const Tab = createMaterialTopTabNavigator();

export default function AdminInquiryScreen() {
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

//  타입
type InquiryItem = {
  askId: number;
  title: string;
  productName: string;
  size: string;
  imgUrl: string;
  answer?: string; // 답변완료일 때
};

// NEW 탭
function NewInquiryTab() {
  const token = useAuthStore(state => state.token);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(
    null,
  );
  const [answer, setAnswer] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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

  const openAnswerModal = (item: InquiryItem) => {
    setSelectedInquiry(item);
    setModalVisible(true);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert('오류', '답변 내용을 입력하세요.');
      return;
    }
    try {
      await axios.post(
        `${SERVER_URL}/api/v1/admin/asks/answer`,
        {
          askId: selectedInquiry?.askId,
          answer,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      Alert.alert('성공', '답변이 등록되었습니다.');
      setModalVisible(false);
      setAnswer('');
      fetchNewInquiries(); // 리스트 새로고침
    } catch (err) {
      Alert.alert('오류', '답변 등록에 실패했습니다.');
    }
  };

  const renderItem = ({ item }: { item: InquiryItem }) => (
    <TouchableOpacity
      style={styles.itemBox}
      onPress={() => openAnswerModal(item)}
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
    <>
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

      {/* 답변 등록 모달 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>답변 등록</Text>
            <Text style={styles.modalSubtitle}>{selectedInquiry?.title}</Text>
            <TextInput
              placeholder="답변 내용을 입력하세요."
              style={styles.input}
              multiline
              value={answer}
              onChangeText={setAnswer}
            />
            <View style={styles.modalButtons}>
              <Button title="취소" onPress={() => setModalVisible(false)} />
              <Button title="등록" onPress={submitAnswer} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ✅ 답변완료 탭
function CompletedInquiryTab() {
  const token = useAuthStore(state => state.token);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const fetchCompletedInquiries = useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/v1/admin/asks/completed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries(res.data);
    } catch (err) {
      Alert.alert('오류', '답변완료 문의를 불러오는 데 실패했습니다.');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchCompletedInquiries();
    }, [fetchCompletedInquiries]),
  );

  const openDetailModal = (item: InquiryItem) => {
    setSelectedInquiry(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: InquiryItem }) => (
    <TouchableOpacity
      style={styles.itemBox}
      onPress={() => openDetailModal(item)}
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
    <>
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

      {/* ✅ 상세 보기 모달 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedInquiry?.title}</Text>
            <Text style={styles.modalSubtitle}>
              {selectedInquiry?.productName} / {selectedInquiry?.size}
            </Text>
            <Text style={styles.detailAnswer}>
              답변: {selectedInquiry?.answer}
            </Text>
            <Button title="닫기" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
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

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 120,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  detailAnswer: { marginTop: 10, fontSize: 15, color: '#333' },
});
