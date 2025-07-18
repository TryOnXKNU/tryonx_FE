export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;

  SignUp: undefined;
  FindId: undefined;
  ResetPassword: undefined;

  MyPage: undefined;

  //장바구니
  Cart: undefined;

  Main:
    | { screen: 'Home' | 'Category' | 'Fitting' | 'Wishlist' | 'MyPage' }
    | undefined;

  //검색
  Search: undefined;
  SearchOutput: { keyword: string };

  // 내정보 수정
  EditProfile: undefined;
  EditProfileImage: undefined;

  //알림
  Notification: undefined;
  //카테고리
  CategoryList: { selectedCategory: string };

  //상품
  ProductDetail: { productId: number };

  //주문
  OrderSheet: { productId: number; size: string; quantity: number };

  OrderComplete: {
    orderId: string;
    productId: number;
  };

  MyOrderList: undefined;
  OrderDetail: { orderId: string };

  //좋아요
  Wishlist: undefined;

  //리뷰
  ReviewWrite: { orderItemId: number };
  ReviewList: { productId: number };
  MyReviewList: undefined;

  //문의
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

// src/types/product.ts
