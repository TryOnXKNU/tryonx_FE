import React, { useState } from 'react';
import {
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  View,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { launchImageLibrary } from 'react-native-image-picker';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';

type RouteParams = {
  form: {
    price: string | number;
    discountRate: string | number;
    categoryId: string | number;
    productItemInfoDtos: any[];
    [key: string]: any;
  };
};

type ImageAsset = {
  uri?: string;
  type?: string;
  fileName?: string;
};

export default function ProductAddImageScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const token = useAuthStore(state => state.token);

  const { form } = route.params as RouteParams;

  const [images, setImages] = useState<ImageAsset[]>([]);
  const MAX_IMAGES = 5;

  // 이미지 선택
  const selectImages = () => {
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('알림', '이미지는 최대 5개까지 선택할 수 있습니다.');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: remainingSlots,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('에러', '이미지 선택 중 오류가 발생했습니다.');
          return;
        }
        if (response.assets?.length) {
          setImages(prev => [...prev, ...(response.assets ?? [])]);
        }
      },
    );
  };

  // 이미지 삭제
  const removeImage = (index: number) => {
    Alert.alert('삭제', '이 이미지를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setImages(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  // 상품 등록 API 호출
  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('알림', '이미지를 최소 1개 이상 골라주세요!');
      return;
    }
    if (!token) {
      Alert.alert('오류', '로그인 정보가 없습니다.');
      return;
    }

    const dto = {
      ...form,
      price: Number(form.price),
      discountRate: Number(form.discountRate),
      categoryId: Number(form.categoryId),
      productItemInfoDtos: form.productItemInfoDtos.map(item => ({
        ...item,
        stock: Number(item.stock),
        length: item.length ? Number(item.length) : null,
        shoulder: item.shoulder ? Number(item.shoulder) : null,
        chest: item.chest ? Number(item.chest) : null,
        sleeveLength: item.sleeveLength ? Number(item.sleeveLength) : null,
        waist: item.waist ? Number(item.waist) : null,
        thigh: item.thigh ? Number(item.thigh) : null,
        rise: item.rise ? Number(item.rise) : null,
        hem: item.hem ? Number(item.hem) : null,
        hip: item.hip ? Number(item.hip) : null,
      })),
    };

    const data = new FormData();

    data.append('dto', {
      string: JSON.stringify(dto),
      name: 'dto',
      type: 'application/json',
    } as any);

    images.forEach((img, index) => {
      if (!img.uri) return;
      const uri = img.uri.startsWith('file://') ? img.uri : `file://${img.uri}`;
      data.append('images', {
        uri,
        type: img.type || 'image/jpeg',
        name: img.fileName || `image${index}.jpg`,
      } as any);
    });

    try {
      await axios.post('http://localhost:8080/api/v1/products', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('성공', '상품이 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () =>
            (navigation as any).navigate('AdminTabs', { screen: 'Products' }),
        },
      ]);
    } catch (error: any) {
      console.error('등록 실패:', error.response?.data || error.message);
      Alert.alert('실패', '상품 등록에 실패했습니다.');
    }
  };

  // 이미지 그리드 렌더링
  const renderImageGrid = () => {
    const imageSlots = [];

    // 첫 번째 슬롯은 항상 카메라 아이콘 (이미지가 있을 때는 숨김)
    imageSlots.push(
      <View key="camera-slot" style={styles.imageSlot}>
        <View style={styles.emptySlot}>
          {images.length < MAX_IMAGES && (
            <TouchableOpacity style={styles.addButton} onPress={selectImages}>
              <Icon name="camera" size={32} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>,
    );

    // 선택된 이미지들 렌더링 (1번부터 시작)
    for (let i = 0; i < images.length; i++) {
      imageSlots.push(
        <View key={`image-${i}`} style={styles.imageSlot}>
          <Image
            source={{ uri: images[i].uri }}
            style={styles.selectedImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeImage(i)}
          >
            <Icon name="close-circle" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>,
      );
    }

    // 나머지 빈 슬롯들 렌더링
    for (let i = images.length; i < MAX_IMAGES - 1; i++) {
      imageSlots.push(
        <View key={`empty-${i}`} style={styles.imageSlot}>
          <View style={styles.emptySlot} />
        </View>,
      );
    }

    return imageSlots;
  };

  return (
    <View style={styles.wrapper}>
      <Header title="상품 등록" showRightIcons={false} hideBackButton={true} />

      <View style={styles.container}>
        <Text style={styles.title}>상품 사진을 등록해주세요.</Text>

        <View style={styles.imageSection}>
          <Text style={styles.imageCount}>
            사진 ({images.length}/{MAX_IMAGES})
          </Text>
          <View style={styles.imageGrid}>{renderImageGrid()}</View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.previousButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.previousButtonText}>이전</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>생성</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  imageSection: {
    alignItems: 'center',
    flex: 1,
  },
  imageCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    marginLeft: 5,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  imageSlot: {
    width: '26%',
    aspectRatio: 1,
    marginBottom: 15,
    marginRight: '5%',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  previousButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
