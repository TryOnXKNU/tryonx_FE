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
import { useFocusEffect } from '@react-navigation/native';

type ExchangeStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COLLECTING'
  | 'COMPLETED';

type ExchangeItem = {
  exchangeId: number;
  memberId: number;
  orderId: number;
  orderItemId: number;
  requestedAt: string;
  status: ExchangeStatus;
  price: number;
  quantity: number;
  productName: string;
  productImageUrl: string;
};

const statusLabels: { [key in ExchangeStatus | 'ALL']: string } = {
  ALL: '전체',
  REQUESTED: '접수',
  ACCEPTED: '접수 완료',
  REJECTED: '접수 반려',
  COLLECTING: '상품 회수',
  COMPLETED: '교환 완료',
};

const statusColors: { [key in ExchangeStatus]: string } = {
  REQUESTED: '#f57c00',
  ACCEPTED: '#1976d2',
  REJECTED: '#d32f2f',
  COLLECTING: '#388e3c',
  COMPLETED: '#7b1fa2',
};

// 날짜 + 시간 포맷 함수
const formatKoreanDateTime = (dateString: string) => {
  const date = new Date(dateString);

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours < 12 ? '오전' : '오후';

  if (hours === 0) {
    hours = 12;
  } else if (hours > 12) {
    hours -= 12;
  }

  return `${year}.${month}.${day} ${ampm} ${hours}:${minutes}`;
};

export default function AdminExchangeListScreen({ navigation }: any) {
  const [exchanges, setExchanges] = useState<ExchangeItem[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<ExchangeItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | ExchangeStatus>(
    'ALL',
  );
  const [searchText, setSearchText] = useState('');
  const { token } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalExchangeId, setModalExchangeId] = useState<number | null>(null);
  const [modalStatus, setModalStatus] = useState<ExchangeStatus | null>(null);
  const [modalReason, setModalReason] = useState('');

  const fetchExchanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        'http://localhost:8080/api/v1/admin/exchanges/all',
        {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error('Failed to fetch exchanges');
      const data: ExchangeItem[] = await res.json();
      setExchanges(data);
      setFilteredExchanges(data);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchExchanges();
    }, [fetchExchanges]),
  );

  useEffect(() => {
    let filtered = exchanges;

    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (searchText.trim()) {
      const lowerSearch = searchText.trim().toLowerCase();
      filtered = filtered.filter(item => {
        const matchesProductName = item.productName
          .toLowerCase()
          .includes(lowerSearch);
        const matchesOrderId = item.orderId.toString().includes(lowerSearch);
        const matchesExchangeId = item.exchangeId
          .toString()
          .includes(lowerSearch);
        const matchesOrderItemId = item.orderItemId
          .toString()
          .includes(lowerSearch);
        return (
          matchesProductName ||
          matchesOrderId ||
          matchesExchangeId ||
          matchesOrderItemId
        );
      });
    }

    setFilteredExchanges(filtered);
  }, [selectedStatus, searchText, exchanges]);

  const updateStatus = async () => {
    if (modalExchangeId === null || modalStatus === null) {
      Alert.alert('오류', '상태와 교환 ID가 필요합니다.');
      return;
    }

    if (modalStatus === 'REJECTED' && modalReason.trim() === '') {
      Alert.alert('알림', '접수 반려 시 사유를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const query =
        modalReason.trim() !== ''
          ? `?reason=${encodeURIComponent(modalReason.trim())}`
          : '';

      const res = await fetch(
        `http://localhost:8080/api/v1/admin/exchanges/${modalExchangeId}/status/${modalStatus}${query}`,
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
      setModalExchangeId(null);
      setModalStatus(null);
      await fetchExchanges();
      Alert.alert('성공', '상태가 변경되었습니다.');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (
    exchangeId: number,
    _currentStatus: ExchangeStatus,
  ) => {
    setModalExchangeId(exchangeId);
    setModalStatus(null);
    setModalReason('');
    setModalVisible(true);
  };

  const renderStatusButtons = (item: ExchangeItem) => (
    <TouchableOpacity
      style={[styles.statusButton, styles.statusButtonPadding]}
      onPress={() => openStatusModal(item.exchangeId, item.status)}
    >
      <Text style={styles.statusButtonText}>상태 변경</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: ExchangeItem }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('AdminExchangeDetail', {
          exchangeId: item.exchangeId,
        })
      }
    >
      <View style={styles.itemContainer}>
        <Image
          source={{ uri: `http://localhost:8080${item.productImageUrl}` }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.productName}</Text>

          {/* 주문 정보 그룹 */}
          <View style={styles.infoGroup}>
            <Text style={styles.groupTitle}>교환 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>교환 ID:</Text>
              <Text style={styles.infoValue}>{item.exchangeId}</Text>
            </View>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.groupTitle}>주문 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주문 ID:</Text>
              <Text style={styles.infoValue}>{item.orderId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주문 아이템 ID:</Text>
              <Text style={styles.infoValue}>{item.orderItemId}</Text>
            </View>
          </View>

          {/* 상품 정보 그룹 */}
          <View style={styles.infoGroup}>
            <Text style={styles.groupTitle}>상품 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>수량:</Text>
              <Text style={styles.infoValue}>{item.quantity} 개</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>가격:</Text>
              <Text style={styles.infoValue}>
                ₩{item.price.toLocaleString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>요청일시:</Text>
              <Text style={styles.infoValue}>
                {formatKoreanDateTime(item.requestedAt)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>상태:</Text>
              <Text
                style={[
                  styles.infoValueBold,
                  { color: statusColors[item.status] },
                ]}
              >
                {statusLabels[item.status]}
              </Text>
            </View>
          </View>

          {renderStatusButtons(item)}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="교환 접수" showRightIcons={false} showHomeButton={false} />

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
            ] as (ExchangeStatus | 'ALL')[]
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

      <TextInput
        placeholder="상품명, 교환 ID, 주문 ID, 주문아이템 ID를 검색하세요."
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
          data={filteredExchanges}
          keyExtractor={item => item.exchangeId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              조회된 교환 접수 내역이 없습니다.
            </Text>
          }
        />
      )}

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
                ] as ExchangeStatus[]
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

            {modalStatus === 'REJECTED' && (
              <>
                <Text style={styles.modalSubTitle}>반려 사유</Text>
                <TextInput
                  multiline
                  style={styles.reasonInput}
                  value={modalReason}
                  onChangeText={setModalReason}
                  placeholder="반려 사유를 입력하세요"
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={updateStatus}
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
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  statusFilterButtonActive: {
    backgroundColor: '#000',
  },
  statusFilterText: {
    color: '#000',
    fontWeight: '600',
  },
  statusFilterTextActive: {
    color: '#fff',
  },

  searchInput: {
    margin: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  activityIndicator: {
    marginTop: 20,
  },

  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },

  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
    fontSize: 16,
  },

  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: '#eee',
  },

  info: {
    flex: 1,
    justifyContent: 'space-between',
  },

  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  infoGroup: {
    marginBottom: 8,
  },

  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },

  infoLabel: {
    width: 90,
    color: '#444',
    fontWeight: '600',
  },

  infoValue: {
    color: '#666',
  },

  infoValueBold: {
    fontWeight: '900',
    color: '#666',
  },

  statusButton: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    backgroundColor: '#000',
  },
  statusButtonPadding: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  statusScrollView: {
    marginBottom: 10,
  },

  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});
