import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/Header';
type Props = {
  navigation: any;
};

export default function OrderCompleteScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* <Header title="결제 완료" showRightIcons={true} hideBackButton={true} /> */}
      <Header title="결제 완료" showRightIcons={true} />
      <View style={styles.viewContainer}>
        <Icon name="check-circle" size={120} color="#4BB543" />
        <Text style={styles.title}>주문 완료 되었습니다.</Text>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate('MyOrderList')}
        >
          <Text style={styles.detailButtonText}>주문 상세 확인 하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  viewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  detailButton: {
    marginTop: 40,
    backgroundColor: '#222',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
