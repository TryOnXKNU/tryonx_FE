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

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'FREE';

type ProductItemInfo = {
  size: Size;
  stock: string; // input value, string으로 받음
  length: string;
  shoulder: string;
  chest: string;
  sleeve_length: string;
  waist: string;
  thigh: string;
  rise: string;
  hem: string;
  hip: string;
};

type FormType = {
  // code: string;
  name: string;
  description: string;
  price: string;
  discountRate: string;
  categoryId: string;
  bodyShape: string;
  status: string;
  productItemInfoDtos: ProductItemInfo[];
};

export default function ProductAddScreen() {
  const token = useAuthStore(state => state.token);
  const navigation = useNavigation();

  // 상태 추가
  // const [products, setProducts] = useState<Product[]>([]);
  // const [loading, setLoading] = useState(false);

  //const SERVER_URL = 'http://localhost:8080';

  // 선택
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [bodyShapeOpen, setBodyShapeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const categoryOptions = [
    { label: 'Top', value: '1' },
    { label: 'Bottom', value: '2' },
    { label: 'Outwear', value: '3' },
    { label: 'Dress', value: '4' },
    { label: 'Acc', value: '5' },
  ];

  const bodyShapeOptions = [
    { label: 'Straight', value: 'STRAIGHT' },
    { label: 'Natural', value: 'NATURAL' },
    { label: 'Wave', value: 'WAVE' },
    { label: 'None', value: 'NONE' },
  ];

  const statusOptions = [
    { label: 'Available (이용 가능)', value: 'AVAILABLE' },
    { label: 'Sold Out (품절)', value: 'SOLDOUT' },
    { label: 'Hidden (숨김)', value: 'HIDDEN' },
  ];

  const placeholderMap: Record<string, string> = {
    // code: '상품 코드를 입력하세요.',
    name: '상품명을 입력하세요.',
    description: '상품 설명을 입력하세요.',
    price: '상품 가격을 입력하세요.',
    discountRate: '상품 할인율을 입력하세요. (0~99)',
    categoryId: '카테고리를 선택하세요.(1~5)',
    bodyShape: '바디 쉐입을 선택하세요.',
    status: '상품 상태를 선택하세요.',
  };

  const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'FREE'];

  const measurementFields = [
    'length',
    'shoulder',
    'chest',
    'sleeve_length',
    'waist',
    'thigh',
    'rise',
    'hem',
    'hip',
  ] as const;

  const [form, setForm] = useState<FormType>({
    // code: '',
    name: '',
    description: '',
    price: '',
    discountRate: '',
    categoryId: '',
    bodyShape: 'STRAIGHT',
    status: 'AVAILABLE',
    productItemInfoDtos: sizes.map(size => ({
      size,
      stock: '',
      length: '',
      shoulder: '',
      chest: '',
      sleeve_length: '',
      waist: '',
      thigh: '',
      rise: '',
      hem: '',
      hip: '',
    })),
  });

  const [images, setImages] = useState<ImagePicker.Asset[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // 아코디언 상태

  const handleChooseImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, response => {
      const assets = response.assets;
      if (assets && Array.isArray(assets)) {
        setImages(prev => [...prev, ...assets]);
      }
    });
  };

  const handleInputChange = (key: keyof FormType, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleProductItemChange = (
    index: number,
    key: keyof ProductItemInfo,
    value: string,
  ) => {
    setForm(prev => {
      const newProductItems = [...prev.productItemInfoDtos];
      newProductItems[index] = {
        ...newProductItems[index],
        [key]: value,
      };
      return {
        ...prev,
        productItemInfoDtos: newProductItems,
      };
    });
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('오류', '로그인 정보가 없습니다.');
      return;
    }

    const requiredFields: (keyof FormType)[] = [
      // 'code',
      'name',
      'description',
      'price',
      'discountRate',
      'categoryId',
    ];

    for (const field of requiredFields) {
      const value = form[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        Alert.alert('모두 입력해주세요.', `${field} 값을 입력해주세요.`);
        return;
      }
    }

    for (const item of form.productItemInfoDtos) {
      if (!item.stock || item.stock.trim() === '') {
        Alert.alert(
          '모두 입력해주세요.',
          `${item.size} 사이즈 재고를 입력해주세요.`,
        );
        return;
      }

      const stockNumber = Number(item.stock);
      if (stockNumber > 0) {
        for (const field of measurementFields) {
          if (!item[field] || item[field].trim() === '') {
            Alert.alert(
              '모두 입력해주세요.',
              `${item.size} 사이즈의 ${field.replace(
                '_',
                ' ',
              )} 실측값을 입력해주세요.`,
            );
            return;
          }
        }
      }
    }

    if (images.length === 0) {
      Alert.alert('사진 선택', '최소 한 개 이상의 이미지를 선택해야 합니다.');
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
      const response = await axios.post(
        'http://localhost:8080/api/v1/products',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('등록 성공:', response.data);
      Alert.alert('성공', '상품이 성공적으로 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('등록 실패:', error.response?.data || error.message);
      Alert.alert('실패', '상품 등록에 실패했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Header title="상품 등록" showRightIcons={true} hideBackButton={false} />

      <ScrollView
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 기본 정보 입력 */}
        {(
          [
            // 'code',
            'name',
            'description',
            'price',
            'discountRate',
          ] as (keyof FormType)[]
        ).map(key => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={placeholderMap[key] || key}
            value={form[key] as string}
            onChangeText={text => handleInputChange(key, text)}
          />
        ))}

        <View style={styles.dropdownWrapper}>
          {/* Category 드롭다운 */}
          <Text style={styles.dropdownLabel}>카테고리</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setCategoryOpen(prev => !prev);
              setBodyShapeOpen(false);
              setStatusOpen(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {categoryOptions.find(opt => opt.value === form.categoryId)
                ?.label || '카테고리 선택'}
            </Text>
          </TouchableOpacity>
          {categoryOpen && (
            <View style={styles.dropdownMenu}>
              {categoryOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleInputChange('categoryId', opt.value);
                    setCategoryOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Body Shape 드롭다운 */}
        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>바디 쉐입</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setBodyShapeOpen(prev => !prev);
              setCategoryOpen(false);
              setStatusOpen(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {
                bodyShapeOptions.find(opt => opt.value === form.bodyShape)
                  ?.label
              }
            </Text>
          </TouchableOpacity>
          {bodyShapeOpen && (
            <View style={styles.dropdownMenu}>
              {bodyShapeOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleInputChange('bodyShape', opt.value);
                    setBodyShapeOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Status 드롭다운 */}
        <View style={styles.dropdownWrapper}>
          <Text style={styles.dropdownLabel}>상품 상태</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => {
              setStatusOpen(prev => !prev);
              setCategoryOpen(false);
              setBodyShapeOpen(false);
            }}
          >
            <Text style={styles.dropdownButtonText}>
              {statusOptions.find(opt => opt.value === form.status)?.label}
            </Text>
          </TouchableOpacity>
          {statusOpen && (
            <View style={styles.dropdownMenu}>
              {statusOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleInputChange('status', opt.value);
                    setStatusOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 사이즈별 재고 및 실측 입력 - 아코디언 */}
        {form.productItemInfoDtos.map((item, index) => (
          <View key={item.size} style={styles.sizeGroup}>
            <View style={styles.sizeTitleRow}>
              <Text style={styles.sizeTitle}>{item.size} 사이즈</Text>
              <TouchableOpacity
                onPress={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
              >
                <Text style={styles.toggleIcon}>
                  {expandedIndex === index ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={`${item.size} 재고를 입력하세요.`}
              keyboardType="numeric"
              value={item.stock}
              onChangeText={text =>
                handleProductItemChange(index, 'stock', text)
              }
            />

            {expandedIndex === index && (
              <>
                {measurementFields.map(field => (
                  <TextInput
                    key={field}
                    style={styles.input}
                    placeholder={`${item.size} ${field.replace('_', ' ')} 입력`}
                    keyboardType="numeric"
                    value={item[field]}
                    onChangeText={text =>
                      handleProductItemChange(index, field, text)
                    }
                  />
                ))}
              </>
            )}
          </View>
        ))}

        {/* 이미지 업로드 */}
        <View style={styles.imageUpload}>
          <TouchableOpacity
            onPress={handleChooseImage}
            style={styles.imageButton}
          >
            <Text style={styles.imageButtonText}>사진 선택</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, i) => (
              <Image
                key={i}
                source={{ uri: img.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>

        {/* 등록 버튼 */}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>등록하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  sizeGroup: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
  },
  sizeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
  },
  imageUpload: {
    marginVertical: 20,
  },
  imageButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dropdownWrapper: {
    marginBottom: 12,
  },
  dropdownLabel: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#000',
  },
});
