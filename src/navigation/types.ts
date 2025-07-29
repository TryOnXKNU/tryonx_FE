export type CartItem = {
  cartItemId: number;
  productId: number;
  productItemId: number;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  imageUrl: string;
  availableSizes: string[];
};

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
  EditProfileImage: undefined;
  MyProfile: undefined;
  EditNickname: undefined;
  EditAddress: undefined;
  EditPassword: undefined;
  EditBodyInfo: undefined;

  //알림
  Notification: undefined;

  //최근 본 상품
  RecentItem: undefined;

  //카테고리
  CategoryList: { selectedCategory: string };

  //상품
  ProductDetail: { productId: number };

  //주문
  OrderSheet:
    | {
        // 바로구매용
        productId: number;
        size: string;
        quantity: number;
      }
    | {
        // 장바구니 결제용
        selectedItems: CartItem[];
        totalPayment: number;
        deliveryFee: number;
        expectedPoints: number;
      };

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

  // 교환 요청
  ExchangeRequest: { orderId: number; orderItemId: number };
  ExchangeList: undefined;
  ExchangeDetail: { exchangeId: number };

  // 반품 요청
  ReturnRequest: { orderId: number; orderItemId: number };
  ReturnList: undefined;
  ReturnDetail: { returnId: number };

  // ReviewList: { productId: number };
  // QaList: { productId: number };
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  ProductAdd: undefined;
  MemberDetail: { memberId: number };
  MemberOrders: { memberId: number };
};
