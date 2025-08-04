import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';

import { useAuthStore } from '../../store/useAuthStore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AdminStackParamList } from '../../navigation/types';

import Header from '../../components/Header';

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'FREE';

type ProductItemInfo = {
  size: Size;
  stock: string;
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
  const token = useAuthStore(state => state.token); // 기존 방식 유지
  // navigation 객체 타입 지정
  const navigation =
    useNavigation<NavigationProp<AdminStackParamList, 'ProductAdd'>>();

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

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [bodyShapeOpen, setBodyShapeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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

  const handleNext = () => {
    const requiredFields: (keyof FormType)[] = [
      'name',
      'description',
      'price',
      'discountRate',
      'categoryId',
    ];

    for (const field of requiredFields) {
      const value = form[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        Alert.alert('입력 오류', `${placeholderMap[field]} 입력해주세요.`);
        return;
      }
    }

    for (const item of form.productItemInfoDtos) {
      if (!item.stock || item.stock.trim() === '') {
        Alert.alert('입력 오류', `${item.size} 사이즈 재고를 입력해주세요.`);
        return;
      }

      const stockNumber = Number(item.stock);
      if (stockNumber > 0) {
        for (const field of measurementFields) {
          if (!item[field] || item[field].trim() === '') {
            Alert.alert(
              '입력 오류',
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

    // token이 없으면 경고 후 return
    if (!token) {
      Alert.alert('로그인 오류', '로그인이 필요합니다.');
      return;
    }

    // 이미지 선택 화면으로 이동, form과 token 같이 넘길 수도 있음
    navigation.navigate('ProductAddImage', { form, token });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Header title="상품 등록" showRightIcons={true} hideBackButton={false} />

      <ScrollView
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {(
          ['name', 'description', 'price', 'discountRate'] as (keyof FormType)[]
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
              placeholder={`${item.size} 사이즈 재고`}
              keyboardType="numeric"
              value={item.stock}
              onChangeText={text =>
                handleProductItemChange(index, 'stock', text)
              }
            />

            {expandedIndex === index && (
              <View style={styles.measurementsContainer}>
                {measurementFields.map(field => (
                  <TextInput
                    key={field}
                    style={styles.input}
                    placeholder={`${item.size} 사이즈 ${field.replace(
                      '_',
                      ' ',
                    )}`}
                    keyboardType="numeric"
                    value={item[field]}
                    onChangeText={text =>
                      handleProductItemChange(index, field, text)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 6,
  },
  dropdownWrapper: { marginVertical: 8 },
  dropdownLabel: { marginBottom: 6, fontWeight: 'bold' },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 5,
  },
  dropdownButtonText: { fontSize: 16 },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    marginTop: 4,
    backgroundColor: '#eee',
  },
  dropdownItem: { padding: 10 },
  dropdownItemText: { fontSize: 16 },
  sizeGroup: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
  },
  sizeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizeTitle: { fontSize: 18, fontWeight: 'bold' },
  toggleIcon: { fontSize: 20, fontWeight: 'bold' },
  measurementsContainer: { marginTop: 10 },
  nextButton: {
    marginTop: 30,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
