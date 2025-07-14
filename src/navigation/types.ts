export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
  FindId: undefined;
  ResetPassword: undefined;
  MyPage: undefined;

  //Main: undefined;

  Main:
    | { screen: 'Home' | 'Category' | 'Fitting' | 'Wishlist' | 'MyPage' }
    | undefined;

  Search: undefined;
  SearchOutput: { keyword: string };
  EditProfile: undefined;
  EditProfileImage: undefined;
  Notification: undefined;
  CategoryList: { selectedCategory: string };
  ProductDetail: { productId: number };
  OrderSheet: { productId: number; size: string; quantity: number };
  OrderComplete: {
    orderId: string;
    productId: number;
  };
  ReviewList: undefined;
  QaList: undefined;
  MyOrderList: undefined;
  OrderDetail: { orderId: string };
  Wishlist: undefined;

  Inquiry: undefined;

  AskForm: {
    productName: string;
    size: string;
    orderItemId?: number;
    imgUrl?: string;
  };

  // ReviewList: { productId: number };
  // QaList: { productId: number };

  // 관리자
  ProductAdd: undefined;
};
