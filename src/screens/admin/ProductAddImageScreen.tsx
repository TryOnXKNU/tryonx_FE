import React, { useState } from 'react';
import {
  Text,
  ScrollView,
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

  // 이미지 선택
  const selectImages = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5,
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

  // 상품 등록 API 호출
  const handleSubmit = async () => {
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
        length: item.length || null,
        shoulder: item.shoulder || null,
        chest: item.chest || null,
        sleeve_length: item.sleeve_length || null,
        waist: item.waist || null,
        thigh: item.thigh || null,
        rise: item.rise || null,
        hem: item.hem || null,
        hip: item.hip || null,
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
          onPress: () => navigation.navigate('ProductManage' as never),
        },
      ]);
    } catch (error: any) {
      console.error('등록 실패:', error.response?.data || error.message);
      Alert.alert('실패', '상품 등록에 실패했습니다.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Header title="상품 등록" showRightIcons={false} hideBackButton={false} />

      <ScrollView style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {images.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.uri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <TouchableOpacity onPress={selectImages} style={styles.selectButton}>
          <Text style={styles.selectButtonText}>이미지 추가하기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>등록하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },

  imageScroll: {
    marginBottom: 20,
  },
  imagePreview: {
    width: 120,
    height: 120,
    marginRight: 10,
    borderRadius: 8,
  },
  selectButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
