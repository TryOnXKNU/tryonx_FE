import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'RECENT_ITEMS';
const MAX_ITEMS = 20;

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

export const getRecentItems = async (): Promise<Product[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('최근 본 상품 불러오기 실패:', error);
    return [];
  }
};

export const saveRecentItem = async (item: Product) => {
  try {
    const items = await getRecentItems();
    // 중복 제거, 가장 최근에 온 아이템은 앞쪽으로
    const filtered = items.filter(i => i.id !== item.id);
    filtered.unshift(item);

    // 최대 개수 제한
    if (filtered.length > MAX_ITEMS) {
      filtered.pop();
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('최근 본 상품 저장 실패:', error);
  }
};
