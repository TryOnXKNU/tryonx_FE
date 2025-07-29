import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

type ReturnStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COLLECTING'
  | 'COMPLETED';

type ReturnItem = {
  returnId: number;
  memberId: number;
  orderId: number;
  orderItemId: number;
  requestedAt: string;
  status: ReturnStatus;
  price: number;
  quantity: number;
  productName: string;
  productImageUrl: string;
};

const statusLabels: { [key in ReturnStatus | 'ALL']: string } = {
  ALL: '전체',
  REQUESTED: '접수',
  ACCEPTED: '접수완료',
  REJECTED: '접수 반려',
  COLLECTING: '상품 회수',
  COMPLETED: '반품 완료',
};

export default function AdminReturnListScreen() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | ReturnStatus>(
    'ALL',
  );
  const [searchText, setSearchText] = useState('');
  const { token } = useAuthStore();

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReturnId, setModalReturnId] = useState<number | null>(null);
  const [modalStatus, setModalStatus] = useState<ReturnStatus | null>(null);
  const [modalReason, setModalReason] = useState('');

  // 반품 내역 조회
  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        'http://localhost:8080/api/v1/admin/returns/all',
        {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error('Failed to fetch returns');
      const data: ReturnItem[] = await res.json();
      setReturns(data);
      setFilteredReturns(data);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // 필터링
  useEffect(() => {
    let filtered = returns;

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (searchText.trim()) {
      filtered = filtered.filter(item =>
        item.productName
          .toLowerCase()
          .includes(searchText.trim().toLowerCase()),
      );
    }

    setFilteredReturns(filtered);
  }, [selectedStatus, searchText, returns]);

  // 상태 변경 API 호출
  const updateStatus = async () => {
    if (modalReturnId === null || modalStatus === null) {
      Alert.alert('오류', '상태와 반품 ID가 필요합니다.');
      return;
    }
    if (modalReason.trim() === '') {
      Alert.alert('알림', '사유를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const query = `?reason=${encodeURIComponent(modalReason.trim())}`;
      const res = await fetch(
        `http://localhost:8080/api/v1/admin/returns/${modalReturnId}/status/${modalStatus}${query}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error('상태 변경 실패');
      }

      setModalVisible(false);
      setModalReason('');
      setModalReturnId(null);
      setModalStatus(null);
      await fetchReturns();
      Alert.alert('성공', '상태가 변경되었습니다.');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모달 열기
  const openStatusModal = (returnId: number) => {
    setModalReturnId(returnId);
    setModalStatus(null);
    setModalReason('');
    setModalVisible(true);
  };

  // 렌더러
  const renderStatusButtons = (item: ReturnItem) => (
    <TouchableOpacity
      style={[styles.statusButton, styles.statusButtonPadding]}
      onPress={() => openStatusModal(item.returnId)}
    >
      <Text style={styles.statusButtonText}>상태 변경</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: ReturnItem }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: `http://localhost:8080${item.productImageUrl}` }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text>주문 ID: {item.orderId}</Text>
        <Text>주문 아이템 ID: {item.orderItemId}</Text>
        <Text>{item.quantity} 개</Text>
        <Text>₩{item.price.toLocaleString()}</Text>
        <Text>{new Date(item.requestedAt).toLocaleString()}</Text>
        <Text>{statusLabels[item.status]}</Text>
        {renderStatusButtons(item)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="반품 접수" showRightIcons={false} showHomeButton={false} />

      {/* 상태 필터 */}
      <View style={styles.statusFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(
            [
              'ALL',
              'REQUESTED',
              'ACCEPTED',
              'REJECTED',
              'COLLECTING',
              'COMPLETED',
            ] as (ReturnStatus | 'ALL')[]
          ).map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterButton,
                selectedStatus === status && styles.statusFilterButtonActive,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === status && styles.statusFilterTextActive,
                ]}
              >
                {statusLabels[status]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 검색 */}
      <TextInput
        placeholder="상품명 검색"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#D32F2F"
          style={styles.activityIndicator}
        />
      ) : (
        <FlatList
          data={filteredReturns}
          keyExtractor={item => item.returnId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>반품 접수 내역이 없습니다.</Text>
          }
        />
      )}

      {/* 상태 변경 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>상태 변경</Text>

            <Text style={styles.modalSubTitle}>변경할 상태 선택</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statusScrollView}
            >
              {(
                [
                  'REQUESTED',
                  'ACCEPTED',
                  'REJECTED',
                  'COLLECTING',
                  'COMPLETED',
                ] as ReturnStatus[]
              ).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusFilterButton,
                    modalStatus === status && styles.statusFilterButtonActive,
                  ]}
                  onPress={() => setModalStatus(status)}
                >
                  <Text
                    style={[
                      styles.statusFilterText,
                      modalStatus === status && styles.statusFilterTextActive,
                    ]}
                  >
                    {statusLabels[status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.reasonLabel}>사유 입력</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="사유를 입력하세요"
              value={modalReason}
              onChangeText={setModalReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  if (!modalStatus) {
                    Alert.alert('알림', '변경할 상태를 선택해주세요.');
                    return;
                  }
                  if (modalReason.trim() === '') {
                    Alert.alert('알림', '사유를 입력해주세요.');
                    return;
                  }
                  updateStatus();
                }}
              >
                <Text style={styles.modalButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  statusFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  statusFilterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  statusFilterButtonActive: {
    backgroundColor: '#D32F2F',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#555',
  },
  statusFilterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchInput: {
    margin: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    elevation: 1,
  },
  image: { width: 70, height: 70, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  activityIndicator: {
    marginTop: 20,
  },
  flatListContent: {
    padding: 15,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
  },
  statusButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 20,
    marginRight: 8,
    marginTop: 10,
  },
  statusButtonPadding: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubTitle: {
    marginTop: 10,
  },
  statusScrollView: {
    marginVertical: 10,
  },
  reasonLabel: {
    marginTop: 10,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  confirmButton: {
    backgroundColor: '#D32F2F',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
