import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import Header from '../components/Header';
import { useAuthStore } from '../store/useAuthStore';

const SERVER_URL = 'http://localhost:8080';

type Notification = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

const NotificationScreen = () => {
  const token = useAuthStore(state => state.token);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!token) {
      Alert.alert('로그인이 필요합니다.', '로그인 후 이용해주세요.');
      return;
    }
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/v1/notice`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sortedData = res.data.sort(
          (a: Notification, b: Notification) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setNotifications(sortedData);
      } catch (err) {
        Alert.alert('오류', '알림을 불러오는 데 실패했습니다.');
      }
    };

    fetchNotifications();
  }, [token]);

  const formatTime = (time: string) => {
    const now = moment();
    const created = moment(time);
    const diffMinutes = now.diff(created, 'minutes');
    const diffHours = now.diff(created, 'hours');
    const diffDays = now.diff(created, 'days');

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return created.format('YY/MM/DD');
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.itemContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <Text style={styles.description}>{item.content}</Text>
      <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header title="알림" showRightIcons={true} hideBackButton={false} />
      <FlatList
        contentContainerStyle={styles.container}
        data={notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>알림이 없습니다.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    padding: 16,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  time: {
    marginTop: 6,
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontSize: 16,
  },
});

export default NotificationScreen;
