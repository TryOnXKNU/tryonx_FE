import React, { useEffect, useState } from 'react';
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
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; // 토큰 불러오기

const SERVER_URL = 'http://localhost:8080';

export default function EditProfileImageScreen() {
  const originalImageUri = require('../assets/images/logo.png');
  const { token } = useAuthStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageData, setImageData] = useState<any>(null); // 업로드용 데이터 저장

  const fetchProfileImage = React.useCallback(async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/v1/users/profile-image`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('프로필 이미지 응답:', res.data);
      if (res.status === 200 && res.data) {
        const fullUrl = `${SERVER_URL}${
          res.data
        }?timestamp=${new Date().getTime()}`;
        console.log('전체 이미지 URL:', fullUrl);
        setImageUri(fullUrl);
      } else {
        setImageUri(null); // 이미지 없으면 기본 이미지 보여주도록
      }
    } catch (e) {
      console.error('프로필 이미지 불러오기 실패:', e);
      setImageUri(null);
    }
  }, [token]);

  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage]);

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
          const asset = response.assets[0];
          setImageUri(asset.uri || null);
          setImageData(asset);
        }
      },
    );
  };

  const handleSave = async () => {
    if (!imageUri || !imageData) {
      Alert.alert('이미지를 선택해주세요.');
      return;
    }

    const formData = new FormData();

    formData.append('profileImage', {
      uri: imageData.uri,
      name: imageData.fileName || 'profile.jpg',
      type: imageData.type || 'image/jpeg',
    } as any);

    try {
      await axios.post(`${SERVER_URL}/api/v1/users/profile-image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('성공', '프로필 이미지가 성공적으로 업데이트되었습니다.');

      // 저장 성공 후 서버에서 최신 프로필 이미지 주소 받아오기
      await fetchProfileImage();
    } catch (error) {
      console.error('프로필 이미지 업로드 실패:', error);
      Alert.alert('실패', '프로필 이미지 업로드에 실패했습니다.');
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header title="프로필 이미지 수정" />

      <View style={styles.container}>
        <View style={styles.avatarWrapper}>
          <Image
            source={imageUri ? { uri: imageUri } : originalImageUri}
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
