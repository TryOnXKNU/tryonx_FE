import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { launchImageLibrary } from 'react-native-image-picker';

export default function EditProfileImageScreen() {
  const originalImageUri = require('../assets/images/logo.png');

  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert(
            '이미지 선택 오류',
            response.errorMessage || '알 수 없는 오류',
          );
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri || null);
        }
      },
    );
  };

  const handleSave = () => {
    if (!imageUri) {
      Alert.alert('이미지를 선택해주세요.');
      return;
    }

    // TODO: API 업로드 및 저장 처리
    Alert.alert('프로필 이미지가 저장되었습니다.');
  };

  return (
    <View style={styles.safeArea}>
      <Header title="프로필 이미지 수정" />

      <View style={styles.container}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: imageUri || originalImageUri }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editIconWrapper}
            onPress={handlePickImage}
          >
            <Icon name="camera-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>저장하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    alignItems: 'center',
    paddingTop: 40,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#eee',
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 6,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
