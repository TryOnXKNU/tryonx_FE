import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text as RNText,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/types';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import Header from '../../components/Header';

const SERVER_URL = 'http://localhost:8080';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminAnswer'>;

export default function AdminAnswerScreen({ route, navigation }: Props) {
  const { askId, title, content, imgUrl, productName, size } = route.params;
  const token = useAuthStore(state => state.token);
  const [answer, setAnswer] = useState('');

  const submitAnswer = async () => {
    if (!answer.trim()) {
      Alert.alert('오류', '답변 내용을 입력하세요.');
      return;
    }
    try {
      await axios.post(
        `${SERVER_URL}/api/v1/admin/asks/answer`,
        { askId, answer },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert('성공', '답변이 등록되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert('오류', '답변 등록에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="답변 등록" hideBackButton={false} showRightIcons={false} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* 상품 이미지 */}
        <Image
          source={{ uri: `${SERVER_URL}${imgUrl}` }}
          style={styles.image}
        />

        {/* 문의 정보 */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.product}>
          {productName} · {size}
        </Text>
        <Text style={styles.contentText}>{content}</Text>

        {/* 답변 입력 */}
        <TextInput
          placeholder="답변 내용을 입력하세요."
          style={styles.input}
          multiline
          numberOfLines={5}
          value={answer}
          onChangeText={setAnswer}
        />
        <TouchableOpacity style={styles.buttonContainer} onPress={submitAnswer}>
          <RNText style={styles.buttonText}>등록</RNText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
  product: { fontSize: 14, color: '#777', marginBottom: 12 },
  contentText: { fontSize: 16, color: '#333', marginBottom: 20 },
  input: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  buttonContainer: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
