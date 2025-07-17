import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'react-native-image-picker';
import { useAuthStore } from '../store/useAuthStore';
import Header from '../components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';

type RouteParams = {
  orderItemId: number;
};

const SERVER_URL = 'http://localhost:8080';

export default function ReviewWriteScreen() {
  const { token } = useAuthStore();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderItemId } = route.params as RouteParams;

  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [images, setImages] = useState<ImagePicker.Asset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('orderItemId:', orderItemId);
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

  const submitReview = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert('별점을 1에서 5 사이로 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('리뷰 내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      const dto = {
        orderItemId,
        content,
        rating,
      };

      formData.append('dto', {
        name: 'dto',
        type: 'application/json',
        string: JSON.stringify(dto),
      } as any);

      images.forEach((image, idx) => {
        if (!image.uri) return;

        const uri = image.uri.startsWith('file://')
          ? image.uri
          : `file://${image.uri}`;

        formData.append('images', {
          uri,
          name: image.fileName ?? `image${idx}.jpg`,
          type: image.type ?? 'image/jpeg',
        } as any);
      });

      await axios.post(`${SERVER_URL}/api/v1/reviews`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type은 axios가 자동으로 multipart/form-data로 설정
        },
      });

      Alert.alert('성공', '리뷰가 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('리뷰 등록 실패:', error.response?.data || error.message);
      Alert.alert('오류', '리뷰 등록 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <Header title="리뷰 작성" showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>별점 (1~5)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="별점을 입력하세요"
          maxLength={1}
          value={rating !== null ? rating.toString() : ''}
          onChangeText={text => {
            const num = Number(text);
            setRating(num >= 1 && num <= 5 ? num : null);
          }}
        />

        <Text style={styles.label}>리뷰 내용</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          placeholder="리뷰 내용을 작성해주세요"
          value={content}
          onChangeText={setContent}
        />

        <Text style={styles.label}>사진 첨부 ({images.length}/5)</Text>
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

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.disabledBtn]}
          onPress={submitReview}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? '등록 중...' : '리뷰 등록'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imageStyle: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  imageAddButton: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  imageAddButtonText: {
    fontSize: 24,
    color: '#777',
  },
  submitBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#555',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
