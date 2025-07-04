import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Header() {
  return (
    <SafeAreaView style={styles.header}>
      <Image
        source={require('../assets/images/headerLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.headerIcons}>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconSpacing}>
          <Icon name="cart-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 40,
    marginLeft: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    marginRight: 20,
  },

  iconSpacing: { marginLeft: 16 },
});
