import MainTabNavigator from './MainTabNavigator';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import FittingScreen from '../screens/FittingScreen';
import WishlistScreen from '../screens/WishlistScreen';
import { useAuthStore } from '../store/useAuthStore';
// removed unused imports
import MyPageScreen from '../screens/MyPageScreen';

export default function MainStack() {
  useAuthStore();

  return (
    <MainTabNavigator
      tabs={[
        {
          name: 'Category',
          component: CategoryScreen,
          label: '카테고리',
          icon: 'grid-outline',
        },
        {
          name: 'Fitting',
          component: FittingScreen,
          label: 'AI피팅',
          icon: 'body-outline',
        },
        {
          name: 'Home',
          component: HomeScreen,
          label: '홈',
          icon: 'home-outline',
        },
        {
          name: 'Wishlist',
          component: WishlistScreen,
          label: '좋아요',
          icon: 'heart-outline',
        },
        {
          name: 'MyPage',
          component: MyPageScreen,
          label: '마이페이지',
          icon: 'person-outline',
        },
      ]}
      theme={{
        activeColor: '#000',
        inactiveColor: '#aaa',
        backgroundColor: '#fff',
      }}
    />
  );
}
