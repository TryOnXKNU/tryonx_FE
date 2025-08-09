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
import {
  AdminStackParamList,
  Size,
  ProductItemInfo,
  FormType,
} from '../../navigation/types';

import Header from '../../components/Header';

// 공용 타입은 `src/navigation/types`에서 import하여 중복 선언을 방지합니다.

export default function ProductAddScreen() {
  const token = useAuthStore(state => state.token);
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
    { label: '판매중', value: 'AVAILABLE' },
    { label: '품절', value: 'SOLDOUT' },
    { label: '숨김', value: 'HIDDEN' },
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
    'sleeveLength',
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
      sleeveLength: '',
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

    if (!token) {
      Alert.alert('로그인 오류', '로그인이 필요합니다.');
      return;
    }

    navigation.navigate('ProductAddImage', { form, token });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Header title="상품 등록" showRightIcons={false} hideBackButton={false} />

      <ScrollView
        style={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 기본 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>상품명 *</Text>
            <TextInput
              style={styles.input}
              placeholder="상품명을 입력하세요"
              value={form.name}
              onChangeText={text => handleInputChange('name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>상품 설명 *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="상품 설명을 입력하세요"
              multiline
              numberOfLines={4}
              value={form.description}
              onChangeText={text => handleInputChange('description', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1, styles.mr8]}>
              <Text style={styles.label}>가격 *</Text>
              <TextInput
                style={styles.input}
                placeholder="가격을 입력하세요"
                keyboardType="numeric"
                value={form.price}
                onChangeText={text => handleInputChange('price', text)}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.ml8]}>
              <Text style={styles.label}>할인율 *</Text>
              <TextInput
                style={styles.input}
                placeholder="0~99"
                keyboardType="numeric"
                value={form.discountRate}
                onChangeText={text => handleInputChange('discountRate', text)}
              />
            </View>
          </View>
        </View>

        {/* 카테고리 및 옵션 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리 및 옵션</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>카테고리 *</Text>
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

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1, styles.mr8]}>
              <Text style={styles.label}>바디 쉐입</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setBodyShapeOpen(prev => !prev);
                  setCategoryOpen(false);
                  setStatusOpen(false);
                }}
              >
                <Text style={styles.dropdownButtonText}>
                  {bodyShapeOptions.find(opt => opt.value === form.bodyShape)
                    ?.label || '바디 쉐입 선택'}
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

            <View style={[styles.inputGroup, styles.flex1, styles.ml8]}>
              <Text style={styles.label}>상품 상태</Text>
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
          </View>
        </View>

        {/* 사이즈별 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>사이즈별 정보</Text>

          {form.productItemInfoDtos.map((item, index) => (
            <View key={item.size} style={styles.sizeCard}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sizeTitle}>{item.size} 사이즈</Text>
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                >
                  <Text style={styles.expandButtonText}>
                    {expandedIndex === index ? '접기' : '펼치기'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>재고 *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={`${item.size} 사이즈 재고`}
                  keyboardType="numeric"
                  value={item.stock}
                  onChangeText={text =>
                    handleProductItemChange(index, 'stock', text)
                  }
                />
              </View>

              {expandedIndex === index && (
                <View style={styles.measurementsContainer}>
                  <Text style={styles.measurementsTitle}>실측 정보</Text>
                  <View style={styles.measurementsGrid}>
                    {measurementFields.map(field => (
                      <View key={field} style={styles.measureItem}>
                        <Text style={styles.smallLabel}>
                          {field.replace('_', ' ')}
                        </Text>
                        <TextInput
                          style={styles.input}
                          placeholder={field.replace('_', ' ')}
                          keyboardType="numeric"
                          value={item[field]}
                          onChangeText={text =>
                            handleProductItemChange(index, field, text)
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  mr8: {
    marginRight: 8,
  },
  ml8: {
    marginLeft: 8,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  sizeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sizeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  expandButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  expandButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  measurementsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  measurementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measureItem: {
    width: '48%',
  },
  smallLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
