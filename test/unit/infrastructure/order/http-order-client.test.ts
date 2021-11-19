import { mocked } from 'ts-jest/utils';
import { BinanceOrderClient } from '../../../../src/code/infrastructure/order/exchanges/binance/binance-order-client';
import { HttpOrderClient } from '../../../../src/code/infrastructure/order/http-order-client';
import { Order, OrderExchange, TransientOrder } from '../../../../src/code/domain/order/model/order';
import { buildDefaultOrder } from '../../../builders/domain/order/order-test-builder';

const binanceOrderClientMock = mocked(jest.genMockFromModule<BinanceOrderClient>('../../../../src/code/infrastructure/order/exchanges/binance/binance-order-client'), true);

let orderClient: HttpOrderClient;
beforeEach(() => {
  binanceOrderClientMock.getExchange = jest.fn();
  binanceOrderClientMock.sendOrder = jest.fn();

  orderClient = new HttpOrderClient([binanceOrderClientMock]);
});

describe('HttpOrderClient', () => {
  beforeEach(() => {
    binanceOrderClientMock.getExchange.mockReturnValue('Binance');
  });

  describe('Given a transient order to send', () => {
    let transientOrder: TransientOrder;

    beforeEach(() => {
      transientOrder = buildDefaultOrder();
    });

    describe('When exchange is unknown', () => {
      beforeEach(() => {
        transientOrder.exchange = 'Unknown' as OrderExchange;
      });

      it('Then error is thrown', async () => {
        try {
          await orderClient.send(transientOrder);
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual("Unsupported 'Unknown' exchange");
        }

        expect(binanceOrderClientMock.getExchange).toHaveBeenCalledTimes(1);
        const getExchangeParams = binanceOrderClientMock.getExchange.mock.calls[0];
        expect(getExchangeParams.length).toEqual(0);

        expect(binanceOrderClientMock.sendOrder).toHaveBeenCalledTimes(0);
      });
    });

    describe('When exchange is known', () => {
      let order: Order;

      beforeEach(() => {
        order = buildDefaultOrder();

        binanceOrderClientMock.sendOrder.mockResolvedValueOnce(order);
      });

      it('Then order is returned', async () => {
        const result = await orderClient.send(transientOrder);
        expect(result).toEqual(order);

        expect(binanceOrderClientMock.getExchange).toHaveBeenCalledTimes(1);
        const getExchangeParams = binanceOrderClientMock.getExchange.mock.calls[0];
        expect(getExchangeParams.length).toEqual(0);

        expect(binanceOrderClientMock.sendOrder).toHaveBeenCalledTimes(1);
        const sendOrderParams = binanceOrderClientMock.sendOrder.mock.calls[0];
        expect(sendOrderParams.length).toEqual(1);
        expect(sendOrderParams[0]).toEqual(transientOrder);
      });
    });
  });
});
