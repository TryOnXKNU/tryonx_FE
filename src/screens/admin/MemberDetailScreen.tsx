import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';
import Header from '../../components/Header';
import { useAuthStore } from '../../store/useAuthStore';

type Props = NativeStackScreenProps<AdminStackParamList, 'MemberDetail'>;

type MemberDetail = {
  profileUrl: string | null;
  name: string;
  memberId: number;
  nickName: string;
  phoneNumber: string;
  birthday: string;
  address: string | null;
  email?: string | null;
  bodyType: number;
  height: number;
  weight: number;
};

const API_BASE = 'http://localhost:8080/api/v1/admin/members';

export default function MemberDetailScreen({ route }: Props) {
  const { memberId } = route.params;
  const token = useAuthStore(state => state.token);

  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/${memberId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch member');
        return res.json();
      })
      .then(data => setMember(data))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, [memberId, token]);

  if (loading)
    return <ActivityIndicator style={styles.loadingIndicator} size="large" />;

  if (!member)
    return (
      <Text style={styles.errorText}>회원 정보를 불러올 수 없습니다.</Text>
    );

  // bodyType 변환 함수 추가
  const getBodyTypeLabel = (type: number) => {
    switch (type) {
      case 0:
        return 'STRAIGHT';
      case 1:
        return 'NATURAL';
      case 2:
        return 'WAVE';
      default:
        return '알 수 없음';
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="회원 상세" showRightIcons={false} hideBackButton={false} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* 상단 프로필 영역 */}
        <View style={styles.profileSection}>
          {member.profileUrl ? (
            <Image
              source={{ uri: `http://localhost:8080${member.profileUrl}` }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.noImage]}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.memberId}>{member.memberId}</Text>
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 상세 정보 */}
        <View style={styles.infoSection}>
          <InfoRow label="닉네임" value={member.nickName} />
          <InfoRow label="전화번호" value={member.phoneNumber} />
          <InfoRow label="생년월일" value={member.birthday} />
          <InfoRow label="배송지" value={member.address ?? '등록되지 않음'} />
          <InfoRow label="이메일" value={member.email ?? '등록되지 않음'} />
          <InfoRow label="체형" value={getBodyTypeLabel(member.bodyType)} />
          <InfoRow label="키" value={`${member.height} cm`} />
          <InfoRow label="몸무게" value={`${member.weight} kg`} />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
  },
  loadingIndicator: { flex: 1 },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: 'red',
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  noImage: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: { color: '#999' },
  profileInfo: {
    flex: 1,
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  memberId: { fontSize: 14, color: '#666', marginTop: 4 },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },

  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
