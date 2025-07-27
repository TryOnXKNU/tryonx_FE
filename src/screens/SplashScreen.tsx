// import React, { useEffect } from 'react';
// import { View, StyleSheet, Image } from 'react-native';

// function SplashScreen({ navigation }: any) {
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.replace('Login');
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require('../assets/images/logo.png')}
//         style={styles.logo}
//         resizeMode="contain"
//       />
//     </View>
//   );
// }

// export default SplashScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 400,
//     height: 400,
//   },
// });
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 400,
    height: 400,
  },
});
