import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Header from '../components/Header';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';

const SERVER_URL = 'http://localhost:8080';

type AskFormRouteProp = RouteProp<
  {
    params: {
      productName: string;
      size: string;
      orderItemId?: number;
      imgUrl?: string;
    };
  },
  'params'
>;

export default function AskFormScreen() {
  const { token } = useAuthStore();
  const navigation = useNavigation();
  const route = useRoute<AskFormRouteProp>();
  const { productName, size, orderItemId, imgUrl } = route.params;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<ImagePicker.Asset[]>([]);
  const fullImageUrl = imgUrl?.startsWith('http')
    ? imgUrl
    : `${SERVER_URL}${imgUrl}`;

  // orderItemId가 제대로 들어오는지 바로 확인
  useEffect(() => {
    console.log('orderItemId:', orderItemId);
    if (!orderItemId) {
      Alert.alert(
        '경고',
        'orderItemId가 없습니다. 문의가 정상 처리되지 않을 수 있습니다.',
      );
    }
  }, [orderItemId]);

  const pickImages = () => {
    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 5 - images.length,
      },
      res => {
        if (res.didCancel) return;
        if (res.assets) {
          if (images.length + res.assets.length > 5) {
            Alert.alert('최대 5장까지 선택할 수 있습니다.');
            return;
          }
          setImages(prev => [...prev, ...res.assets!]);
        }
      },
    );
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    const dto = {
      orderItemId,
      title,
      content,
    };

    const formData = new FormData();

    // dto를 JSON 문자열로 보내기
    formData.append('dto', {
      string: JSON.stringify(dto),
      name: 'dto',
      type: 'application/json',
    } as any);

    images.forEach((image, idx) => {
      if (!image.uri) return;

      const uri = image.uri.startsWith('file://')
        ? image.uri
        : `file://${image.uri}`;

      formData.append('images', {
        uri,
        type: image.type ?? 'image/jpeg',
        name: image.fileName ?? `image${idx}.jpg`,
      } as any);
    });

    try {
      await axios.post(`${SERVER_URL}/api/v1/ask`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type는 생략하는 게 좋아요. axios가 자동 설정합니다.
        },
      });

      Alert.alert('성공', '문의가 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('문의 등록 실패:', error.response?.data || error.message);
      Alert.alert('오류', '문의 등록 중 문제가 발생했습니다.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flexOne}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="문의 작성" showRightIcons={false} hideBackButton={false} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* 이미지 + 상품명/사이즈 가로 배치 */}
        <View style={styles.productInfoContainer}>
          {imgUrl && (
            <Image
              source={{ uri: fullImageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          )}
          <View style={styles.productTextContainer}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.productSize}>사이즈: {size}</Text>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="제목을 입력하세요"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.contentInput]}
          placeholder="문의 내용을 입력하세요"
          value={content}
          onChangeText={setContent}
          multiline
        />

        {/* 사진 개수 상태 추가 */}
        <Text style={styles.label}>사진 ({images.length}/5)</Text>
        <View style={styles.imageContainer}>
          {images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img.uri }}
              style={styles.imageStyle}
            />
          ))}
          {images.length < 5 && (
            <TouchableOpacity
              onPress={pickImages}
              style={styles.imageAddButton}
            >
              <Text style={styles.imageAddButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button title="문의하기" onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  productInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  productTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  productSize: {
    fontSize: 14,
    color: '#555',
  },

  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  contentInput: {
    height: 100,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  imageStyle: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
  },
  imageAddButton: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAddButtonText: {
    fontSize: 24,
    color: '#777',
  },
  text: {
    marginBottom: 8,
  },
});
