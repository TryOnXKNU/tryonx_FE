import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Header from '../components/Header';

const dummyQas = [
  {
    id: 1,
    type: '사이즈',
    title: 'L 사이즈 있나요?',
    status: '답변 완료',
    date: '2025-06-25',
  },
  {
    id: 2,
    type: '배송',
    title: '배송 기간은?',
    status: '답변 대기',
    date: '2025-06-26',
  },
  {
    id: 3,
    type: '배송',
    title: '배송 기간은?',
    status: '답변 대기',
    date: '2025-06-26',
  },
];

export default function QaListScreen() {
  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <Header
        title="문의 전체 보기"
        showRightIcons={true}
        hideBackButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {dummyQas.map(qa => (
          <View key={qa.id} style={styles.qaItem}>
            <Text style={styles.qaType}>{qa.type} 문의</Text>
            <Text style={styles.qaTitle}>{qa.title}</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.qaStatus]}>{qa.status}</Text>
              <Text style={styles.qaDate}>{qa.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  qaItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 12,
  },
  qaType: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  qaTitle: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qaStatus: {
    fontWeight: '600',
  },
  qaDate: {
    fontSize: 12,
    color: '#999',
  },
});
