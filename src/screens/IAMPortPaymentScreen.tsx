import React, { useRef } from 'react';
import IMP from 'iamport-react-native';
import { Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PaymentInfo } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'> & {
  route: {
    params: {
      paymentInfo: PaymentInfo;
      token: string;
    };
  };
};

export default function IAMPortPaymentScreen({ route, navigation }: Props) {
  const { paymentInfo, token } = route.params;
  const paymentInfoRef = useRef(paymentInfo);
  const tokenRef = useRef(token);

  // 1. 결제 완료 검증 함수 (서버에 imp_uid, merchant_uid 보내서 검증)
  const handlePaymentComplete = async (
    imp_uid: string,
    merchant_uid: string,
  ) => {
    try {
      const authToken = tokenRef.current;
      const verifyResponse = await fetch(
        'http://192.168.0.23:8080/api/v1/payment/complete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ imp_uid, merchant_uid }),
        },
      );

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(`결제 검증 실패: ${errorText}`);
      }

      const verifyData = await verifyResponse.json();
      console.log('결제 검증 성공:', verifyData);

      // 검증 성공 후 주문 API 호출
      await handleOrder(merchant_uid);
    } catch (error) {
      console.error('결제 완료 처리 오류:', error);
      Alert.alert('결제 검증 오류', (error as Error).message);
      navigation.goBack();
    }
  };

  // 2. 주문 생성 함수
  const handleOrder = async (_merchant_uid: string) => {
    const info = paymentInfoRef.current;
    const authToken = tokenRef.current;

    const {
      isDirectOrder,
      selectedItems,
      selectedRequest,
      size,
      quantity,
      usedPoint,
      productId,
      method,
    } = info;

    const pointsToUse = parseInt(usedPoint || '0', 10);

    let body: any;

    if (isDirectOrder) {
      body = {
        items: [{ productId, size, quantity }],
        point: pointsToUse,
        paymentMethod: method,
        deliveryRequest: selectedRequest,
        merchantUid: _merchant_uid,
      };
    } else {
      body = {
        items: selectedItems?.map(
          (item: { productId: number; size: string; quantity: number }) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
          }),
        ),
        point: pointsToUse,
        paymentMethod: method,
        deliveryRequest: selectedRequest,
        merchantUid: _merchant_uid,
      };
    }

    try {
      console.log('주문 요청 :', JSON.stringify(body, null, 2));
      console.log('Authorization 토큰:', authToken);

      const response = await fetch('http://192.168.0.23:8080/api/v1/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('응답 상태 코드:', response.status);

      let responseData;

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const errorText = await response.text();
          console.error('서버에서 JSON 아닌 에러 응답:', errorText);
          throw new Error(`서버 오류 응답: ${errorText}`);
        }
      } catch (parseError) {
        console.error('JSON 파싱 실패:', parseError);
        throw new Error(
          `응답 파싱 실패: ${
            parseError instanceof Error
              ? parseError.message
              : String(parseError)
          }`,
        );
      }

      if (!response.ok) {
        console.error('주문 실패 - 응답 데이터:', responseData);
        throw new Error(
          `주문 처리에 실패했습니다. 상태 코드: ${response.status} 메시지: ${
            responseData.message || JSON.stringify(responseData)
          }`,
        );
      }

      console.log('주문 성공 - 응답 데이터:', responseData);

      const orderId = responseData.orderId;

      navigation.replace('OrderComplete', {
        orderId,
        productId: isDirectOrder ? productId : selectedItems?.[0].productId,
      });
    } catch (error) {
      console.error('주문 요청 중 예외 발생:', error);
      Alert.alert('오류', (error as Error).message);
      navigation.goBack();
    }
  };

  return (
    <IMP.Payment
      userCode={'imp85468817'}
      loading={<></>}
      data={{
        pg: paymentInfo.pg,
        pay_method: paymentInfo.method,
        name: paymentInfo.name,
        merchant_uid: `order_${new Date().getTime()}`,
        amount: paymentInfo.amount,
        buyer_name: paymentInfo.buyerName,
        buyer_tel: paymentInfo.buyerTel,
        buyer_addr: paymentInfo.buyerAddr,
        buyer_email: 'jungb1203@naver.com',
        escrow: false,
        app_scheme: 'tryonx',
      }}
      callback={response => {
        console.log('결제 콜백 응답:', response);
        console.log(' 고정된 paymentInfo:', paymentInfoRef.current);

        if (response.imp_uid && response.merchant_uid) {
          handlePaymentComplete(response.imp_uid, response.merchant_uid);
          // handleOrder(response.merchant_uid ?? '');
        } else {
          Alert.alert('결제 실패', '결제가 정상적으로 완료되지 않았습니다.');
          navigation.goBack();
        }
      }}
    />
  );
}
