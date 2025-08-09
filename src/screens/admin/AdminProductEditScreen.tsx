import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';
import Header from '../../components/Header';

interface ServerImage {
  id: number;
  url: string;
}

interface ProductItem {
  size: string;
  stock: number;
  status: string;
  length: number;
  shoulder: number;
  chest: number;
  sleeve_length?: number;
  sleeveLength?: number;
  waist: number;
  thigh: number;
  rise: number;
  hem: number;
  hip: number;
}

interface ProductDetail {
  productId: number;
  productName: string;
  productPrice: number;
  likeCount: number | null;
  categoryId: number;
  description: string;
  productImages: string[];
  productItems: ProductItem[];
}

export default function AdminProductEditScreen() {
  const { params } = useRoute<any>();
  const { productId } = params;
  const token = useAuthStore(state => state.token);

  const [loading, setLoading] = useState(false);

  // 전체 상품 정보 저장
  const [product, setProduct] = useState<ProductDetail | null>(null);
  // 이미지 상태 따로 관리 (id 부여)
  const [images, setImages] = useState<ServerImage[]>([]);

  const SERVER_BASE_URL = 'http://localhost:8080';

  // 수정 가능하게 form 상태 분리
  type BodyShape = 'STRAIGHT' | 'NATURAL' | 'WAVE' | 'NONE';
  type ProductStatus = 'AVAILABLE' | 'SOLDOUT' | 'HIDDEN';
  type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'FREE';

  const BODY_SHAPE_OPTIONS: { label: string; value: BodyShape }[] = [
    { label: 'Straight', value: 'STRAIGHT' },
    { label: 'Natural', value: 'NATURAL' },
    { label: 'Wave', value: 'WAVE' },
    { label: 'None', value: 'NONE' },
  ];

  const STATUS_OPTIONS: { label: string; value: ProductStatus }[] = [
    { label: '판매중', value: 'AVAILABLE' },
    { label: '품절', value: 'SOLDOUT' },
    { label: '숨김', value: 'HIDDEN' },
  ];

  const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'FREE'];

  const CATEGORY_OPTIONS = [
    { label: 'Top', value: '1' },
    { label: 'Bottom', value: '2' },
    { label: 'Outwear', value: '3' },
    { label: 'Dress', value: '4' },
    { label: 'Acc', value: '5' },
  ];

  const [form, setForm] = useState({
    productName: '',
    productPrice: '',
    categoryId: '',
    description: '',
    discountRate: '',
    bodyShape: 'STRAIGHT' as BodyShape,
  });

  type EditableItem = {
    size: Size;
    stock: string;
    status: ProductStatus;
    length: string;
    shoulder: string;
    chest: string;
    sleeveLength: string; // UI는 camelCase로 관리
    waist: string;
    thigh: string;
    rise: string;
    hem: string;
    hip: string;
  };

  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);
  const [bodyShapeOpen, setBodyShapeOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  // 선택 모달
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<'SIZE' | 'STATUS' | null>(null);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const fetchProductDetail = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${SERVER_BASE_URL}/api/v1/admin/product/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data: ProductDetail = response.data;

      setProduct(data);

      const imagesWithId =
        data.productImages?.map((url: string, index: number) => ({
          id: index,
          url,
        })) || [];
      setImages(imagesWithId);

      // form 초기값 설정 (productName/description은 비활성으로 표시만)
      setForm({
        productName: data.productName,
        productPrice: data.productPrice.toString(),
        categoryId: data.categoryId.toString(),
        description: data.description,
        discountRate: '0',
        bodyShape: 'STRAIGHT',
      });

      // 사이즈별 편집 상태 초기화 (숫자를 문자열로 변환)
      setEditableItems(
        (data.productItems || []).map(item => {
          const sleeveLen =
            (item as any).sleeveLength ?? (item as any).sleeve_length;
          return {
            size: (item.size as Size) || 'FREE',
            stock: String(item.stock ?? ''),
            status: (item.status as ProductStatus) || 'AVAILABLE',
            length: String(item.length ?? ''),
            shoulder: String(item.shoulder ?? ''),
            chest: String(item.chest ?? ''),
            sleeveLength:
              sleeveLen !== undefined && sleeveLen !== null
                ? String(sleeveLen)
                : '',
            waist: String(item.waist ?? ''),
            thigh: String(item.thigh ?? ''),
            rise: String(item.rise ?? ''),
            hem: String(item.hem ?? ''),
            hip: String(item.hip ?? ''),
          };
        }),
      );
    } catch (error) {
      console.error('상품 불러오기 실패:', error);
      Alert.alert('오류', '상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  const handleInputChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (
    index: number,
    key: keyof EditableItem,
    value: string | Size | ProductStatus,
  ) => {
    setEditableItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value } as EditableItem;
      return next;
    });
  };

  const openPicker = (type: 'SIZE' | 'STATUS', index: number) => {
    setPickerType(type);
    setPickerIndex(index);
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    setPickerType(null);
    setPickerIndex(null);
  };

  const handleSave = async () => {
    if (!token) {
      Alert.alert('오류', '로그인 정보가 없습니다.');
      return;
    }

    if (!product) return;

    try {
      setLoading(true);

      // productItems 편집값을 API 스키마에 맞게 변환
      const productItemInfoDtos = editableItems.map(item => ({
        size: item.size,
        stock: Number(item.stock || 0),
        status: item.status,
        length: Number(item.length || 0),
        shoulder: Number(item.shoulder || 0),
        chest: Number(item.chest || 0),
        sleeveLength: Number(item.sleeveLength || 0),
        waist: Number(item.waist || 0),
        thigh: Number(item.thigh || 0),
        rise: Number(item.rise || 0),
        hem: Number(item.hem || 0),
        hip: Number(item.hip || 0),
      }));

      const payload = {
        productItemInfoDtos,
        price: Number(form.productPrice || 0),
        discountRate: Number(form.discountRate || 0),
        categoryId: Number(form.categoryId || 0),
        bodyShape: form.bodyShape,
      };

      await axios.patch(
        `${SERVER_BASE_URL}/api/v1/admin/product/${productId}/detail`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      Alert.alert('성공', '상품 정보가 수정되었습니다.');
    } catch (error) {
      console.error('상품 수정 실패:', error);
      Alert.alert('실패', '상품 정보 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="상품 수정" showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>상품명</Text>
        <TextInput
          style={[styles.input, styles.readonly]}
          value={form.productName}
          editable={false}
          placeholder="상품명"
        />

        <Text style={styles.label}>가격</Text>
        <TextInput
          style={styles.input}
          value={form.productPrice}
          onChangeText={text => handleInputChange('productPrice', text)}
          placeholder="가격을 입력하세요"
          keyboardType="numeric"
        />

        <Text style={styles.label}>할인율</Text>
        <TextInput
          style={styles.input}
          value={form.discountRate}
          onChangeText={text => handleInputChange('discountRate', text)}
          placeholder="할인율을 입력하세요 (0~99)"
          keyboardType="numeric"
        />

        <Text style={styles.label}>카테고리</Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setCategoryOpen(prev => !prev)}
          >
            <Text style={styles.dropdownButtonText}>
              {CATEGORY_OPTIONS.find(opt => opt.value === form.categoryId)
                ?.label || '카테고리 선택'}
            </Text>
          </TouchableOpacity>
          {categoryOpen && (
            <View style={styles.dropdownMenu}>
              {CATEGORY_OPTIONS.map(opt => (
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

        <Text style={styles.label}>바디 쉐입</Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setBodyShapeOpen(prev => !prev)}
          >
            <Text style={styles.dropdownButtonText}>
              {
                BODY_SHAPE_OPTIONS.find(opt => opt.value === form.bodyShape)
                  ?.label
              }
            </Text>
          </TouchableOpacity>
          {bodyShapeOpen && (
            <View style={styles.dropdownMenu}>
              {BODY_SHAPE_OPTIONS.map(opt => (
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

        <Text style={styles.label}>설명</Text>
        <TextInput
          style={[styles.input, styles.textArea, styles.readonly]}
          value={form.description}
          editable={false}
          placeholder="설명"
          multiline
        />

        <Text style={styles.label}>상품 이미지</Text>
        <View style={styles.imagePreview}>
          {images.map(img => (
            <View key={img.id} style={styles.imageItemWrapper}>
              <Image
                source={{
                  uri: img.url.startsWith('http')
                    ? img.url
                    : `${SERVER_BASE_URL}${img.url}`,
                }}
                style={styles.image}
              />
            </View>
          ))}
        </View>

        <Text style={styles.label}>상품 사이즈/재고/상태/실측</Text>
        {editableItems.length === 0 && (
          <Text style={styles.value}>등록된 상품 아이템이 없습니다.</Text>
        )}
        {editableItems.map((item, idx) => (
          <View key={`${item.size}-${idx}`} style={styles.productItemContainer}>
            <View style={styles.rowBetween}>
              <View style={[styles.flex1, styles.mr8]}>
                <Text style={styles.smallLabel}>사이즈</Text>
                <View style={styles.inlinePickerRow}>
                  <Text style={styles.inlinePickerValue}>{item.size}</Text>
                </View>
              </View>
              <View style={[styles.flex1, styles.ml8]}>
                <Text style={styles.smallLabel}>상태</Text>
                <View style={styles.inlinePickerRow}>
                  <Text style={styles.inlinePickerValue}>
                    {
                      STATUS_OPTIONS.find(opt => opt.value === item.status)
                        ?.label
                    }
                  </Text>
                  <TouchableOpacity
                    style={styles.inlinePickerButton}
                    onPress={() => openPicker('STATUS', idx)}
                  >
                    <Text style={styles.inlinePickerButtonText}>변경</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.rowBetween}>
              <View style={[styles.flex1, styles.mr8]}>
                <Text style={styles.smallLabel}>재고</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={item.stock}
                  onChangeText={text => handleItemChange(idx, 'stock', text)}
                  placeholder="재고"
                />
              </View>
              <View style={[styles.flex1, styles.ml8]} />
            </View>

            <View style={styles.measurementsGrid}>
              {(
                [
                  ['length', '총장'],
                  ['shoulder', '어깨'],
                  ['chest', '가슴'],
                  ['sleeveLength', '소매 길이'],
                  ['waist', '허리'],
                  ['thigh', '허벅지'],
                  ['rise', '밑위'],
                  ['hem', '밑단'],
                  ['hip', '엉덩이'],
                ] as const
              ).map(([key, label]) => (
                <View key={key} style={styles.measureItem}>
                  <Text style={styles.smallLabel}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={item[key].toString()}
                    onChangeText={text => handleItemChange(idx, key, text)}
                    placeholder={label}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>

        {/* 선택 모달 */}
        <Modal
          visible={pickerVisible}
          transparent
          animationType="fade"
          onRequestClose={closePicker}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>
                {pickerType === 'SIZE' ? '사이즈 선택' : '상태 선택'}
              </Text>
              {(pickerType === 'SIZE' ? SIZES : STATUS_OPTIONS).map(option => (
                <TouchableOpacity
                  key={
                    pickerType === 'SIZE'
                      ? (option as string)
                      : (option as { value: string }).value
                  }
                  style={styles.modalOption}
                  onPress={() => {
                    if (pickerIndex === null) return;
                    if (pickerType === 'SIZE') {
                      handleItemChange(pickerIndex, 'size', option as Size);
                    } else {
                      handleItemChange(
                        pickerIndex,
                        'status',
                        (option as { value: ProductStatus }).value,
                      );
                    }
                    closePicker();
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    {pickerType === 'SIZE'
                      ? (option as string)
                      : (option as { label: string }).label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={closePicker}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    marginTop: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  readonly: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  imagePreview: {
    flexDirection: 'row',
    marginTop: 10,
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  imageItemWrapper: { position: 'relative', marginRight: 10 },

  productItemContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  productItemText: {
    fontSize: 14,
    marginBottom: 2,
  },
  smallLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  textArea: { height: 100, textAlignVertical: 'top' as const },
  flex1: { flex: 1 },
  mr8: { marginRight: 8 },
  ml8: { marginLeft: 8 },
  inlinePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inlinePickerValue: { fontSize: 16, color: '#333' },
  inlinePickerButton: {
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inlinePickerButtonText: { color: '#333', fontWeight: '600' },
  measurementsGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measureItem: {
    width: '48%',
  },
  dropdownWrapper: { marginTop: 8 },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dropdownButtonText: { fontSize: 16, color: '#333' },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#f0f0f0',
  },
  dropdownItem: { padding: 10 },
  dropdownItemText: { fontSize: 16, color: '#333' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  modalOption: { paddingVertical: 12 },
  modalOptionText: { fontSize: 16, color: '#333' },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  modalCancelText: { color: '#333', fontWeight: '600' },

  saveButton: {
    marginTop: 30,
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
