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
