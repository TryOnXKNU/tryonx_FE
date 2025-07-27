import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../components/Header';

export default function OrderManageScreen() {
  return (
    <View style={styles.container}>
      <Header title="주문 관리" showRightIcons={false} hideBackButton={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
