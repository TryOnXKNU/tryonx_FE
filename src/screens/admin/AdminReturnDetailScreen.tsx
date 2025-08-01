import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

type ReturnStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COLLECTING'
  | 'COMPLETED';

type ReturnDetail = {
  returnId: number;
  memberId: number;
  orderId: number;
  orderItemId: number;
  price: number;
  quantity: number;
  reason: string;
  requestedAt: string;
  processedAt: string | null;
  status: ReturnStatus;
  productName: string;
  productImageUrl: string;
};

const statusLabels: { [key in ReturnStatus]: string } = {
  REQUESTED: '접수',
  ACCEPTED: '접수 완료',
  REJECTED: '접수 반려',
  COLLECTING: '상품 회수',
  COMPLETED: '반품 완료',
};

const statusColors: { [key in ReturnStatus]: string } = {
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

export default function AdminReturnDetailScreen() {
  const route = useRoute<any>();
  const { token } = useAuthStore();
  const { returnId } = route.params;

  const [detail, setDetail] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStatus, setModalStatus] = useState<ReturnStatus | null>(null);
  const [modalReason, setModalReason] = useState('');

  // 상세 데이터 가져오기
  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/admin/returns/${returnId}`,
        {
          headers: {
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error('상세 조회 실패');
      const data: ReturnDetail = await res.json();
      setDetail(data);
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [returnId, token]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail]),
  );

  const openStatusModal = () => {
    setModalStatus(null);
    setModalReason('');
    setModalVisible(true);
  };

  // 상태 업데이트
  const updateStatus = async () => {
    if (!modalStatus) {
      Alert.alert('알림', '변경할 상태를 선택해주세요.');
      return;
    }
    if (modalStatus === 'REJECTED' && modalReason.trim() === '') {
      Alert.alert('알림', '반려 사유를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const query = modalReason.trim()
        ? `?reason=${encodeURIComponent(modalReason.trim())}`
        : '';
      const res = await fetch(
        `http://localhost:8080/api/v1/admin/returns/${returnId}/status/${modalStatus}${query}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error('상태 변경 실패');

      setModalVisible(false);
      await fetchDetail();
      Alert.alert('성공', '상태가 변경되었습니다.');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '상태 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !detail) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.loader}>
        <Text>상세 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="반품 상세" showRightIcons={false} showHomeButton={false} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image
          source={{ uri: `http://localhost:8080${detail.productImageUrl}` }}
          style={styles.image}
        />
        <Text style={styles.productName}>{detail.productName}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <Text style={styles.infoText}>반품 ID: {detail.returnId}</Text>
          <Text style={styles.infoText}>회원 ID: {detail.memberId}</Text>
          <Text style={styles.infoText}>주문 ID: {detail.orderId}</Text>
          <Text style={styles.infoText}>
            주문 아이템 ID: {detail.orderItemId}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>가격 및 수량</Text>
          <Text style={styles.infoText}>수량: {detail.quantity} 개</Text>
          <Text style={styles.infoText}>
            가격: ₩{detail.price.toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>반품 사유</Text>
          <Text style={styles.infoText}>{detail.reason}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>처리 정보</Text>
          <Text style={styles.infoText}>
            요청일: {formatKoreanDateTime(detail.requestedAt)}
          </Text>
          <Text style={styles.infoText}>
            처리일:{' '}
            {detail.processedAt
              ? formatKoreanDateTime(detail.processedAt)
              : '처리 전'}
          </Text>

          <Text
            style={[
              styles.infoText,
              styles.boldText,
              { color: statusColors[detail.status] },
            ]}
          >
            상태: {statusLabels[detail.status]}
          </Text>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={openStatusModal}>
          <Text style={styles.updateButtonText}>상태 변경</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 상태 변경 모달 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>상태 변경</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.statusScroll}
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
                    styles.statusButton,
                    modalStatus === status && {
                      backgroundColor: statusColors[status],
                      borderColor: statusColors[status],
                    },
                  ]}
                  onPress={() => setModalStatus(status)}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      modalStatus === status && styles.whiteText,
                    ]}
                  >
                    {statusLabels[status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {modalStatus === 'REJECTED' && (
              <>
                <Text style={styles.reasonLabel}>반려 사유 입력</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="반려 사유를 입력하세요"
                  value={modalReason}
                  onChangeText={setModalReason}
                  multiline
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
  scrollContainer: { padding: 16, paddingBottom: 30 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#d32f2f',
  },
  infoText: { fontSize: 14, color: '#333', marginBottom: 4 },
  boldText: { fontWeight: '900' },
  whiteText: { color: '#fff' },
  updateButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
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
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  statusScroll: {
    marginVertical: 10,
  },
  statusButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  statusButtonText: { color: '#000', fontWeight: '600' },
  reasonLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 12,
  },
  cancelButton: { backgroundColor: '#aaa' },
  confirmButton: { backgroundColor: '#000' },
  modalButtonText: { color: '#fff', fontWeight: '700' },
});
