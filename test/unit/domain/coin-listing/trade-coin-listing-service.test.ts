import { mocked } from 'ts-jest/utils';
import { expect } from '@jest/globals';
import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';
import { buildDefaultCoinListing } from '../../../builders/domain/coin-listing/coin-listing-builder';
import { TradeCoinListingService } from '../../../../src/code/domain/coin-listing/trade-coin-listing-service';
import { CreateOrderService } from '../../../../src/code/domain/order/create-order-service';
import MockDate from 'mockdate';
import { Order } from '../../../../src/code/domain/order/model/order';
import { buildDefaultOrder } from '../../../builders/domain/order/order-test-builder';

const createOrderServiceMock = mocked(jest.genMockFromModule<CreateOrderService>('../../../../src/code/domain/order/create-order-service'), true);

let tradeCoinListingService: TradeCoinListingService;
beforeEach(() => {
  createOrderServiceMock.create = jest.fn();

  tradeCoinListingService = new TradeCoinListingService('XXX', 20, 100, createOrderServiceMock);
});

describe('TradeCoinListingService', () => {
  let date: Date;

  beforeEach(() => {
    date = new Date('2021-09-17T00:00:11.666Z');
    MockDate.set(date);
  });

  describe('Given a coin listing to trade', () => {
    let coinListing: CoinListing;
    let buyOrder: Order;
    let sellOrder: Order;

    beforeEach(() => {
      coinListing = buildDefaultCoinListing();
      buyOrder = buildDefaultOrder();
      sellOrder = buildDefaultOrder();
    });

    describe('When listing date has passed', () => {
      beforeEach(() => {
        coinListing.listingDate = new Date(date.valueOf() - 1);
      });

      it('Then error is thrown', async () => {
        try {
          await tradeCoinListingService.trade(coinListing);
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual('Listing date has passed');
        }

        expect(createOrderServiceMock.create).toHaveBeenCalledTimes(0);
      });
    });

    describe('When orders have failed', () => {
      beforeEach(() => {
        createOrderServiceMock.create.mockRejectedValueOnce(new Error('Buy order error !')).mockRejectedValueOnce(new Error('Buy order error !')).mockResolvedValueOnce(buyOrder);
        createOrderServiceMock.create.mockRejectedValueOnce(new Error('Sell order error !')).mockResolvedValueOnce(sellOrder);
      });

      it('Then orders are retried until success', async () => {
        await tradeCoinListingService.trade(coinListing);

        expect(createOrderServiceMock.create).toHaveBeenCalledTimes(5);
        let createParams = createOrderServiceMock.create.mock.calls[0];
        expect(createParams.length).toEqual(1);
        expect(createParams[0]).toEqual({
          exchange: coinListing.exchange,
          symbol: `${coinListing.coin}#XXX`,
          side: 'Buy',
          type: 'Market',
          quote: true,
          requestedQuantity: 20,
        });
        createParams = createOrderServiceMock.create.mock.calls[1];
        expect(createParams.length).toEqual(1);
        expect(createParams[0]).toEqual({
          exchange: coinListing.exchange,
          symbol: `${coinListing.coin}#XXX`,
          side: 'Buy',
          type: 'Market',
          quote: true,
          requestedQuantity: 20,
        });
        createParams = createOrderServiceMock.create.mock.calls[2];
        expect(createParams.length).toEqual(1);
        expect(createParams[0]).toEqual({
          exchange: coinListing.exchange,
          symbol: `${coinListing.coin}#XXX`,
          side: 'Buy',
          type: 'Market',
          quote: true,
          requestedQuantity: 20,
        });
        createParams = createOrderServiceMock.create.mock.calls[3];
        expect(createParams.length).toEqual(1);
        expect(createParams[0]).toEqual({
          exchange: coinListing.exchange,
          symbol: `${coinListing.coin}#XXX`,
          side: 'Sell',
          type: 'Limit',
          quote: false,
          requestedQuantity: buyOrder.executedQuantity!,
          requestedPrice: buyOrder.executedPrice! * 1.5,
        });
        createParams = createOrderServiceMock.create.mock.calls[4];
        expect(createParams.length).toEqual(1);
        expect(createParams[0]).toEqual({
          exchange: coinListing.exchange,
          symbol: `${coinListing.coin}#XXX`,
          side: 'Sell',
          type: 'Limit',
          quote: false,
          requestedQuantity: buyOrder.executedQuantity!,
          requestedPrice: buyOrder.executedPrice! * 1.5,
        });
      });
    });
  });
});
