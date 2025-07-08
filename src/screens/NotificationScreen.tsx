import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import moment from 'moment';
import Header from '../components/Header';

type Notification = {
  id: string;
  title: string;
  description: string;
  productName?: string;
  productOption?: string;
  createdAt: string; // ISO string
  read: boolean;
};

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // API 호출하여 알림 데이터 받아올 예정
    const dummyData: Notification[] = [
      {
        id: '1',
        title: '비밀번호 변경 안내',
        description: '비밀번호 재설정에서 비밀번호를 재설정했습니다.',
        createdAt: moment().subtract(10, 'minutes').toISOString(),
        read: false,
      },
      {
        id: '2',
        title: '좋아요 한 상품이 품절임박이에요!',
        description: ' 멋진티셔츠 / M',
        createdAt: moment().subtract(3, 'days').toISOString(),
        read: true,
      },
      {
        id: '3',
        title: '이벤트 알림',
        description: '여름 세일이 시작됐어요!',
        createdAt: moment('2024-03-14').toISOString(),
        read: true,
      },
    ];

    setNotifications(dummyData);
  }, []);

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
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.description}>{item.description}</Text>
      {item.productName && (
        <Text style={styles.productInfo}>
          {item.productName} / 옵션: {item.productOption}
        </Text>
      )}
      <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <Header title="알림" showRightIcons={true} hideBackButton={false} />
      <FlatList
        contentContainerStyle={styles.container}
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginLeft: 8,
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  productInfo: {
    marginTop: 4,
    fontSize: 13,
    color: '#888',
  },
  time: {
    marginTop: 6,
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
});

export default NotificationScreen;
