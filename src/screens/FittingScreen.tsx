import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';

// type NavigationProp = StackNavigationProp<RootStackParamList, 'Fitting'>;

const categories = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Dresses', 'Acc'];
const bodyTypes = ['Wave', 'Straight', 'Natural'];
const sampleProducts = Array.from({ length: 12 }, (_, index) => ({
  id: `${index + 1}`,
  image: `https://picsum.photos/200?random=${index + 1}`,
}));

export default function FittingScreen() {
  // const navigation = useNavigation();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(
    'female',
  );
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('Wave');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <Header title="AI피팅" showRightIcons={true} hideBackButton={true} />

      {/* 고정된 상단 콘텐츠 */}
      <View style={styles.contentContainer}>
        {/* 마네킹 영역 */}
        <View style={styles.mannequinWrapper}>
          <View style={styles.mannequinPlaceholder}>
            <Text style={styles.mannequinText}>마네킹</Text>
          </View>

          {/* 체형 선택 + 카메라 버튼 */}
          <View style={styles.mannequinControls}>
            <TouchableOpacity
              style={styles.bodyTypeDisplay}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.bodyTypeText}>{selectedBodyType}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 성별 버튼 */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.genderToggle}
            onPress={() =>
              setSelectedGender(prev => (prev === 'female' ? 'male' : 'female'))
            }
          >
            <Icon
              name={selectedGender === 'female' ? 'female' : 'male'}
              size={16}
              color="#000"
              style={styles.genderText}
            />
            <Text style={styles.iconWithMarginRight}>
              {selectedGender === 'female' ? '여성' : '남성'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButtonCentered}>
          <Text style={styles.saveButtonText}>이미지 저장</Text>
        </TouchableOpacity>

        {/* 카테고리 탭 */}
        <View style={styles.categoryTabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categorySelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* 상품 그리드 (FlatList만 스크롤 가능) */}
      <FlatList
        data={sampleProducts}
        keyExtractor={item => item.id}
        numColumns={4}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <Text style={styles.productText}>상품 {item.id}</Text>
          </View>
        )}
        contentContainerStyle={styles.productGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* 체형 선택 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>체형 선택</Text>
            {bodyTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedBodyType(type);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marginLeft16: {
    marginLeft: 16,
  },
  contentContainer: {
    padding: 16,
  },
  mannequinWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mannequinPlaceholder: {
    width: 140,
    height: 220,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mannequinText: {
    color: '#999',
  },
  mannequinControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  iconWithMarginRight: {
    marginRight: 6,
  },
  bodyTypeDisplay: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  bodyTypeText: {
    fontSize: 14,
    color: '#000',
  },
  cameraButton: {
    backgroundColor: '#000',
    marginLeft: 12,
    borderRadius: 24,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
    alignItems: 'center',
  },
  genderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  genderText: {
    fontSize: 14,
  },
  saveButtonCentered: {
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  categoryTabs: {
    marginBottom: 16,
  },
  categoryButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  categorySelected: {
    backgroundColor: '#000',
  },
  categoryText: {
    color: '#000',
    fontSize: 13,
  },
  categoryTextSelected: {
    color: '#fff',
    fontSize: 13,
  },
  productGrid: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  productItem: {
    flex: 1 / 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
  },
  productText: {
    fontSize: 12,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 14,
  },
  modalClose: {
    marginTop: 12,
  },
  modalCloseText: {
    color: '#888',
  },
});
