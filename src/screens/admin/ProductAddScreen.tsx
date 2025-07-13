import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import Header from '../../components/Header';

type FormType = {
  code: string;
  name: string;
  description: string;
  price: string;
  discountRate: string;
  categoryId: string;
  bodyShape: string;
  status: string;
  sizeXsStock: string;
  sizeSStock: string;
  sizeMStock: string;
  sizeLStock: string;
  sizeXLStock: string;
  sizeFreeStock: string;
};

export default function ProductAddScreen() {
  const token = useAuthStore(state => state.token);
  const navigation = useNavigation();

  const placeholderMap: Record<string, string> = {
    code: '상품 코드를 입력하세요.',
    name: '상품명을 입력하세요.',
    description: '상품 설명을 입력하세요.',
    price: '상품 가격을 입력하세요.',
    discountRate: '상품 할인율을 입력하세요. (0~99)',
    categoryId: '카테고리를 선택하세요.(1~5)',
    bodyShape: '바디 쉐입을 선택하세요.',
    status: '상품 상태를 선택하세요.',
    sizeXsStock: 'XS 사이즈 재고를 입력하세요.',
    sizeSStock: 'S 사이즈 재고를 입력하세요.',
    sizeMStock: 'M 사이즈 재고를 입력하세요.',
    sizeLStock: 'L 사이즈 재고를 입력하세요.',
    sizeXLStock: 'XL 사이즈 재고를 입력하세요.',
    sizeFreeStock: 'Free 사이즈 재고를 입력하세요.',
  };

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    discountRate: '',
    categoryId: '',
    bodyShape: 'STRAIGHT',
    status: 'AVAILABLE',
    sizeXsStock: '',
    sizeSStock: '',
    sizeMStock: '',
    sizeLStock: '',
    sizeXLStock: '',
    sizeFreeStock: '',
  });

  const [images, setImages] = useState<ImagePicker.Asset[]>([]);

  const handleChooseImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, response => {
      const assets = response.assets;
      if (assets && Array.isArray(assets)) {
        setImages(prev => [...prev, ...assets]);
      }
    });
  };

  const handleInputChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // handleSubmit 내부 data.append('dto', ...) 부분만 수정

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('오류', '로그인 정보가 없습니다.');
      return;
    }

    // 필수 항목 체크
    const requiredFields: (keyof FormType)[] = [
      'code',
      'name',
      'description',
      'price',
      'discountRate',
      'categoryId',
      'sizeXsStock',
      'sizeSStock',
      'sizeMStock',
      'sizeLStock',
      'sizeXLStock',
      'sizeFreeStock',
    ];

    for (const field of requiredFields) {
      const value = form[field];
      if (!value || value.trim() === '') {
        Alert.alert('모두 입력해주세요.', `${field} 값을 입력해주세요.`);
        return;
      }
    }

    if (images.length === 0) {
      Alert.alert('사진 선택', '최소 한 개 이상의 이미지를 선택해야 합니다.');
      return;
    }

    const data = new FormData();

    data.append('dto', {
      string: JSON.stringify({
        ...form,
        price: Number(form.price),
        discountRate: Number(form.discountRate),
        categoryId: Number(form.categoryId),
        sizeXsStock: Number(form.sizeXsStock),
        sizeSStock: Number(form.sizeSStock),
        sizeMStock: Number(form.sizeMStock),
        sizeLStock: Number(form.sizeLStock),
        sizeXLStock: Number(form.sizeXLStock),
        sizeFreeStock: Number(form.sizeFreeStock),
      }),
      type: 'application/json',
      name: 'dto',
    } as any);

    images.forEach((img, index) => {
      if (img.uri) {
        let uri = img.uri;
        if (!uri.startsWith('file://')) {
          uri = 'file://' + uri;
        }

        data.append('images', {
          uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `image${index}.jpg`,
        } as any);
      }
    });

    try {
      const SERVER_IP = 'localhost';

      const response = await axios.post(
        `http://${SERVER_IP}:8080/api/v1/products`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type은 안 넣기 (axios가 자동으로 multipart/form-data로 설정)
          },
        },
      );
      console.log('등록 성공:', response.data);
      Alert.alert('성공', '상품이 성공적으로 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('등록 실패:', error.response?.data || error.message);
      Alert.alert('실패', '상품 등록에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* 상단 헤더 */}
      <Header title="상품 등록" showRightIcons={true} hideBackButton={false} />

      <ScrollView
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {Object.entries(form).map(([key, value]) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={placeholderMap[key] || key}
            value={value}
            onChangeText={text => handleInputChange(key, text)}
          />
        ))}

        <View style={styles.imagePreview}>
          {images.map((img, index) => (
            <Image
              key={index}
              source={{ uri: img.uri }}
              style={styles.thumbnail}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.customButton}
          onPress={handleChooseImage}
        >
          <Text style={styles.customButtonText}>이미지 선택</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.customButton, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.customButtonText}>상품 등록</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingBottom: 30 },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  // 버튼
  customButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  customButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
  },
});
