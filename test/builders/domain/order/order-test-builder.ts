import { CreateOrder, Order } from '../../../../src/code/domain/order/model/order';
import { randomFromList, randomNumber, randomString, randomSymbol } from '../../random-test-builder';

export const buildDefaultCreateMarketOrder = (): CreateOrder => {
  return {
    exchange: randomFromList(['Binance']),
    symbol: randomSymbol(),
    side: 'Buy',
    type: 'Market',
    quote: false,
    requestedQuantity: randomNumber(1, 100),
  };
};

export const buildDefaultCreateLimitOrder = (): CreateOrder => {
  return {
    exchange: randomFromList(['Binance']),
    symbol: randomSymbol(),
    side: 'Buy',
    type: 'Limit',
    quote: false,
    requestedQuantity: randomNumber(1, 100),
    requestedPrice: randomNumber(10, 1_000),
  };
};

export const buildDefaultOrder = (): Order => {
  return buildDefaultMarketOrder();
};

export const buildDefaultMarketOrder = (): Order => {
  return {
    id: randomString(20),
    exchange: randomFromList(['Binance']),
    symbol: randomSymbol(),
    side: 'Buy',
    type: 'Market',
    status: 'Filled',
    creationDate: new Date(),
    quote: false,
    requestedQuantity: randomNumber(1, 100),
    transactionDate: new Date(),
    externalId: randomString(20),
    externalStatus: 'FILLED',
    executedQuantity: randomNumber(1, 100),
    executedPrice: randomNumber(10, 1_000),
  };
};

export const buildDefaultLimitOrder = (): Order => {
  return {
    id: randomString(20),
    exchange: randomFromList(['Binance']),
    symbol: randomSymbol(),
    side: 'Buy',
    type: 'Limit',
    status: 'Filled',
    creationDate: new Date(),
    quote: false,
    requestedQuantity: randomNumber(1, 100),
    requestedPrice: randomNumber(10, 1_000),
    transactionDate: new Date(),
    externalId: randomString(20),
    externalStatus: 'FILLED',
    executedQuantity: randomNumber(1, 100),
    executedPrice: randomNumber(10, 1_000),
  };
};
