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
  ProductDetail: { product: Product };
};

// ProductDetail 용도
export type Product = {
  id: string;
  category: string;
  image: string;
  name: string;
  price: string;
  likes: number;
};
