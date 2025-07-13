export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SignUp: undefined;
  FindId: undefined;
  ResetPassword: undefined;
  MyPage: undefined;
  Main: undefined;
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
  // ReviewList: { productId: number };
  // QaList: { productId: number };

  // 관리자
  ProductAdd: undefined;
};

// // ProductDetail 용도
// type Product = {
//   productId: number;
//   productName: string;
//   productPrice: number;
//   likeCount: number;
//   categoryId: number;
//   thumbnailUrl: string;
// };
