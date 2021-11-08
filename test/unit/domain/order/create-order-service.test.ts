import { mocked } from 'ts-jest/utils';
import MockDate from 'mockdate';
import { CreateOrder, Order } from '../../../../src/code/domain/order/model/order';
import { buildDefaultCreateLimitOrder, buildDefaultCreateMarketOrder, buildDefaultLimitOrder, buildDefaultMarketOrder } from '../../../builders/domain/order/order-test-builder';
import { CreateOrderService } from '../../../../src/code/domain/order/create-order-service';
import { truncate } from '../../../../src/code/configuration/util/math';
import { GetTickerService } from '../../../../src/code/domain/ticker/get-ticker-service';
import { Ticker } from '../../../../src/code/domain/ticker/model/ticker';
import { buildDefaultTicker } from '../../../builders/domain/ticker/ticker-test-builder';
import { OrderClient } from '../../../../src/code/domain/order/order-client';

const getTickerServiceMock = mocked(jest.genMockFromModule<GetTickerService>('../../../../src/code/domain/ticker/get-ticker-service'), true);
const orderClientMock = mocked(jest.genMockFromModule<OrderClient>('../../../../src/code/domain/order/order-client'), true);

let createOrderService: CreateOrderService;
beforeEach(() => {
  getTickerServiceMock.getByExchangeAndSymbol = jest.fn();
  orderClientMock.send = jest.fn();

  createOrderService = new CreateOrderService(getTickerServiceMock, orderClientMock);
});

describe('CreateOrderService', () => {
  let creationDate: Date;
  let createOrder: CreateOrder;
  let ticker: Ticker;
  let order: Order;

  beforeEach(() => {
    creationDate = new Date();
    MockDate.set(creationDate);

    ticker = buildDefaultTicker();
    getTickerServiceMock.getByExchangeAndSymbol.mockResolvedValue(ticker);
  });

  describe('Given a market order to create', () => {
    beforeEach(() => {
      createOrder = buildDefaultCreateMarketOrder();
    });

    describe('And price limit is not missing', () => {
      beforeEach(() => {
        createOrder.requestedPrice = 10;
      });

      describe('When order is created', () => {
        it('Then error is thrown', async () => {
          try {
            await createOrderService.create(createOrder);
            fail();
          } catch (error) {
            expect((error as Error).message).toEqual('Unable to create a market order with price limit');
          }

          expect(getTickerServiceMock.getByExchangeAndSymbol).toHaveBeenCalledTimes(0);
          expect(orderClientMock.send).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe('And quote quantity', () => {
      beforeEach(() => {
        createOrder.quote = true;
      });

      describe('When order is created', () => {
        beforeEach(() => {
          order = buildDefaultMarketOrder();
          orderClientMock.send.mockResolvedValue(order);
        });

        it('Then created order is returned', async () => {
          const result = await createOrderService.create(createOrder);
          expect(result).toEqual(order);

          expect(getTickerServiceMock.getByExchangeAndSymbol).toHaveBeenCalledTimes(1);
          const getByExchangeAndSymbolParams = getTickerServiceMock.getByExchangeAndSymbol.mock.calls[0];
          expect(getByExchangeAndSymbolParams.length).toEqual(2);
          expect(getByExchangeAndSymbolParams[0]).toEqual(createOrder.exchange);
          expect(getByExchangeAndSymbolParams[1]).toEqual(createOrder.symbol);

          expect(orderClientMock.send).toHaveBeenCalledTimes(1);
          const sendParams = orderClientMock.send.mock.calls[0];
          expect(sendParams.length).toEqual(1);
          expect(sendParams[0]).toEqual({
            ...createOrder,
            id: `${createOrder.exchange}/${createOrder.symbol}/${createOrder.side}/${createOrder.type}/${creationDate.valueOf()}`,
            requestedQuantity: truncate(createOrder.requestedQuantity, ticker.quoteAssetPrecision),
            status: 'Waiting',
            creationDate: creationDate,
          });
        });
      });
    });

    describe('And base quantity', () => {
      beforeEach(() => {
        createOrder.quote = false;
      });

      describe('When order is created', () => {
        beforeEach(() => {
          order = buildDefaultMarketOrder();
          orderClientMock.send.mockResolvedValue(order);
        });

        it('Then created order is returned', async () => {
          const result = await createOrderService.create(createOrder);
          expect(result).toEqual(order);

          expect(getTickerServiceMock.getByExchangeAndSymbol).toHaveBeenCalledTimes(1);
          const getByExchangeAndSymbolParams = getTickerServiceMock.getByExchangeAndSymbol.mock.calls[0];
          expect(getByExchangeAndSymbolParams.length).toEqual(2);
          expect(getByExchangeAndSymbolParams[0]).toEqual(createOrder.exchange);
          expect(getByExchangeAndSymbolParams[1]).toEqual(createOrder.symbol);

          expect(orderClientMock.send).toHaveBeenCalledTimes(1);
          const sendParams = orderClientMock.send.mock.calls[0];
          expect(sendParams.length).toEqual(1);
          expect(sendParams[0]).toEqual({
            ...createOrder,
            id: `${createOrder.exchange}/${createOrder.symbol}/${createOrder.side}/${createOrder.type}/${creationDate.valueOf()}`,
            requestedQuantity: truncate(createOrder.requestedQuantity, ticker.quantityPrecision),
            status: 'Waiting',
            creationDate: creationDate,
          });
        });
      });
    });
  });

  describe('Given a limit order to create', () => {
    beforeEach(() => {
      createOrder = buildDefaultCreateLimitOrder();
    });

    describe('And price limit is missing', () => {
      beforeEach(() => {
        createOrder.requestedPrice = undefined;
      });

      describe('When order is created', () => {
        it('Then error is thrown', async () => {
          try {
            await createOrderService.create(createOrder);
            fail();
          } catch (error) {
            expect((error as Error).message).toEqual('Unable to create a limit order without price limit');
          }

          expect(getTickerServiceMock.getByExchangeAndSymbol).toHaveBeenCalledTimes(0);
          expect(orderClientMock.send).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe('And quote quantity', () => {
      beforeEach(() => {
        createOrder.quote = true;
      });

      describe('When order is created', () => {
        it('Then error is thrown', async () => {
          try {
            await createOrderService.create(createOrder);
            fail();
          } catch (error) {
            expect((error as Error).message).toEqual('Unable to create a limit order using quote asset quantity');
          }

          expect(getTickerServiceMock.getByExchangeAndSymbol).toHaveBeenCalledTimes(0);
          expect(orderClientMock.send).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe('And base quantity', () => {
      beforeEach(() => {
        createOrder.quote = false;
      });

      describe('When order is created', () => {
        beforeEach(() => {
          order = buildDefaultLimitOrder();
          orderClientMock.send.mockResolvedValue(order);
        });

        it('Then created order is returned', async () => {
          const result = await createOrderService.create(createOrder);
          expect(result).toEqual(order);

          expect(getTickerServiceMock.getByExchangeAndSymbol).toHaveBeenCalledTimes(1);
          const getByExchangeAndSymbolParams = getTickerServiceMock.getByExchangeAndSymbol.mock.calls[0];
          expect(getByExchangeAndSymbolParams.length).toEqual(2);
          expect(getByExchangeAndSymbolParams[0]).toEqual(createOrder.exchange);
          expect(getByExchangeAndSymbolParams[1]).toEqual(createOrder.symbol);

          expect(orderClientMock.send).toHaveBeenCalledTimes(1);
          const sendParams = orderClientMock.send.mock.calls[0];
          expect(sendParams.length).toEqual(1);
          expect(sendParams[0]).toEqual({
            ...createOrder,
            id: `${createOrder.exchange}/${createOrder.symbol}/${createOrder.side}/${createOrder.type}/${creationDate.valueOf()}`,
            requestedQuantity: truncate(createOrder.requestedQuantity, ticker.quantityPrecision),
            requestedPrice: truncate(createOrder.requestedPrice!, ticker.pricePrecision),
            status: 'Waiting',
            creationDate: creationDate,
          });
        });
      });
    });
  });
});
