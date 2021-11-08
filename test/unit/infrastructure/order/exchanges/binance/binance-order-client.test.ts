import { axiosInstance } from '../../../../../../src/code/configuration/http/axios';
import { mocked } from 'ts-jest/utils';
import { BinanceOrderClient } from '../../../../../../src/code/infrastructure/order/exchanges/binance/binance-order-client';
import { BinanceAuthentication } from '../../../../../../src/code/infrastructure/common/exchanges/binance/binance-authentication';
import { OrderType, TransientOrder } from '../../../../../../src/code/domain/order/model/order';
import { buildDefaultCreateLimitOrder, buildDefaultCreateMarketOrder, buildDefaultOrder } from '../../../../../builders/domain/order/order-test-builder';
import { BinanceOrder } from '../../../../../../src/code/infrastructure/common/exchanges/binance/model/binance-order';
import { buildDefaultBinanceLimitOrder, buildDefaultBinanceMarketOrder } from '../../../../../builders/infrastructure/common/exchanges/binance/binance-order-test-builder';
import { fromBinanceOrderStatus, toBinanceOrderSide, toBinanceSymbol } from '../../../../../../src/code/infrastructure/common/exchanges/binance/binance-converter';
import { round } from '../../../../../../src/code/configuration/util/math';
import MockDate from 'mockdate';

jest.mock('../../../../../../src/code/configuration/http/axios');

const axiosInstanceMock = mocked(axiosInstance, true);
const binanceAuthenticationMock = mocked(jest.genMockFromModule<BinanceAuthentication>('../../../../../../src/code/infrastructure/common/exchanges/binance/binance-authentication'), true);

let binanceOrderClient: BinanceOrderClient;
beforeEach(() => {
  binanceAuthenticationMock.getSignature = jest.fn();
  binanceAuthenticationMock.getApiKey = jest.fn();

  binanceOrderClient = new BinanceOrderClient('my-url', binanceAuthenticationMock);
});

describe('BinanceOrderClient', () => {
  let date: Date;

  beforeEach(() => {
    date = new Date('2021-09-17T00:00:11.666Z');
    MockDate.set(date);
  });

  describe('Given the exchange to retrieve', () => {
    it('Then Binance exchange is returned', async () => {
      expect(binanceOrderClient.getExchange()).toEqual('Binance');
    });
  });

  describe('Given an unknown transient order to send', () => {
    let transientOrder: TransientOrder;

    beforeEach(() => {
      transientOrder = { ...buildDefaultOrder(), type: 'Unknown' as OrderType };
    });

    describe('When transient order is sent', () => {
      it('Then error is thrown', async () => {
        try {
          await binanceOrderClient.sendOrder(transientOrder);
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual("Unsupported 'Unknown' Binance order type");
        }

        expect(binanceAuthenticationMock.getSignature).toHaveBeenCalledTimes(0);
        expect(binanceAuthenticationMock.getApiKey).toHaveBeenCalledTimes(0);
        expect(axiosInstanceMock.post).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('Given a transient market order to send', () => {
    let transientOrder: TransientOrder;
    let binanceOrder: BinanceOrder;

    beforeEach(() => {
      binanceAuthenticationMock.getSignature.mockResolvedValueOnce('my-signature');
      binanceAuthenticationMock.getApiKey.mockResolvedValueOnce('my-api-key');

      transientOrder = {
        ...buildDefaultCreateMarketOrder(),
        id: '123',
        status: 'Waiting',
        creationDate: new Date(),
      };
      binanceOrder = buildDefaultBinanceMarketOrder();

      axiosInstanceMock.post.mockResolvedValueOnce({
        data: binanceOrder,
      });
    });

    describe('When transient order is sent', () => {
      it('Then order is returned', async () => {
        const result = await binanceOrderClient.sendOrder(transientOrder);
        expect(result).toEqual({
          ...transientOrder,
          status: fromBinanceOrderStatus(binanceOrder.status),
          externalId: binanceOrder.orderId.toString(),
          externalStatus: binanceOrder.status,
          transactionDate: new Date(binanceOrder.transactTime),
          executedQuantity: round(+binanceOrder.executedQty, 15),
          executedPrice: round(+binanceOrder.cummulativeQuoteQty / +binanceOrder.executedQty, 15),
        });

        const queryParameters = `symbol=${toBinanceSymbol(transientOrder.symbol)}&side=${toBinanceOrderSide(transientOrder.side)}&type=MARKET&quantity=${transientOrder.requestedQuantity}&newOrderRespType=FULL&timestamp=${date.valueOf()}`;

        expect(binanceAuthenticationMock.getSignature).toHaveBeenCalledTimes(1);
        const getSignatureParams = binanceAuthenticationMock.getSignature.mock.calls[0];
        expect(getSignatureParams.length).toEqual(1);
        expect(getSignatureParams[0]).toEqual(queryParameters);

        expect(binanceAuthenticationMock.getApiKey).toHaveBeenCalledTimes(1);
        const getApiKeyParams = binanceAuthenticationMock.getApiKey.mock.calls[0];
        expect(getApiKeyParams.length).toEqual(0);

        expect(axiosInstanceMock.post).toHaveBeenCalledTimes(1);
        const postParams = axiosInstanceMock.post.mock.calls[0];
        expect(postParams.length).toEqual(3);
        expect(postParams[0]).toEqual(`/v3/order?${queryParameters}&signature=my-signature`);
        expect(postParams[1]).toEqual(null);
        expect(postParams[2]).toEqual({
          baseURL: 'my-url',
          headers: {
            'X-MBX-APIKEY': 'my-api-key',
          },
        });
      });
    });
  });

  describe('Given a transient limit order to send', () => {
    let transientOrder: TransientOrder;
    let binanceOrder: BinanceOrder;

    beforeEach(() => {
      binanceAuthenticationMock.getSignature.mockResolvedValueOnce('my-signature');
      binanceAuthenticationMock.getApiKey.mockResolvedValueOnce('my-api-key');

      transientOrder = {
        ...buildDefaultCreateLimitOrder(),
        id: '123',
        status: 'Waiting',
        creationDate: new Date(),
      };
      binanceOrder = buildDefaultBinanceLimitOrder();

      axiosInstanceMock.post.mockResolvedValueOnce({
        data: binanceOrder,
      });
    });

    describe('When transient order is sent', () => {
      it('Then order is returned', async () => {
        const result = await binanceOrderClient.sendOrder(transientOrder);
        expect(result).toEqual({
          ...transientOrder,
          status: fromBinanceOrderStatus(binanceOrder.status),
          externalId: binanceOrder.orderId.toString(),
          externalStatus: binanceOrder.status,
          transactionDate: new Date(binanceOrder.transactTime),
        });

        const queryParameters = `symbol=${toBinanceSymbol(transientOrder.symbol)}&side=${toBinanceOrderSide(transientOrder.side)}&type=LIMIT&quantity=${transientOrder.requestedQuantity}&price=${
          transientOrder.requestedPrice
        }&timeInForce=GTC&newOrderRespType=FULL&timestamp=${date.valueOf()}`;

        expect(binanceAuthenticationMock.getSignature).toHaveBeenCalledTimes(1);
        const getSignatureParams = binanceAuthenticationMock.getSignature.mock.calls[0];
        expect(getSignatureParams.length).toEqual(1);
        expect(getSignatureParams[0]).toEqual(queryParameters);

        expect(binanceAuthenticationMock.getApiKey).toHaveBeenCalledTimes(1);
        const getApiKeyParams = binanceAuthenticationMock.getApiKey.mock.calls[0];
        expect(getApiKeyParams.length).toEqual(0);

        expect(axiosInstanceMock.post).toHaveBeenCalledTimes(1);
        const postParams = axiosInstanceMock.post.mock.calls[0];
        expect(postParams.length).toEqual(3);
        expect(postParams[0]).toEqual(`/v3/order?${queryParameters}&signature=my-signature`);
        expect(postParams[1]).toEqual(null);
        expect(postParams[2]).toEqual({
          baseURL: 'my-url',
          headers: {
            'X-MBX-APIKEY': 'my-api-key',
          },
        });
      });
    });
  });
});
