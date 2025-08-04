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
  PointHistory: undefined;

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

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'FREE';

export type ProductItemInfo = {
  size: Size;
  stock: string;
  length: string;
  shoulder: string;
  chest: string;
  sleeve_length: string;
  waist: string;
  thigh: string;
  rise: string;
  hem: string;
  hip: string;
};

export type FormType = {
  name: string;
  description: string;
  price: string;
  discountRate: string;
  categoryId: string;
  bodyShape: string;
  status: string;
  productItemInfoDtos: ProductItemInfo[];
};

export type AdminStackParamList = {
  AdminTabs: undefined;

  ProductManage: undefined;
  AdminProductDetail: { productId: number };
  ProductAdd: undefined;
  ProductAddImage: { form: FormType; token: string };

  AdminProductEdit: { productId: number };
  AdminProductImageEdit: { productId: number; productInfo: FormType };

  MemberDetail: { memberId: number };
  MemberOrders: { memberId: number };

  AdminExchangeList: undefined;
  AdminExchangeDetail: undefined;
  AdminReturnList: undefined;
  AdminReturnDetail: undefined;

  OrderManage: undefined;

  AdminAsk: undefined;
  AdminAskDetail: { askId: number };
  AdminAnswer: { askId: number; title: string };

  RecentMembers: undefined;
  AllMembers: undefined;
};
