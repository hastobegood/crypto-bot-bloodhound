import { randomFromList, randomNumber, randomString, randomSymbol } from '../../../../random-test-builder';
import { SendOrderOutput, SendOrderOutputFill } from '@hastobegood/crypto-clients-binance';

export const buildDefaultBinanceSendMarketOrderOutput = (): SendOrderOutput => {
  return {
    symbol: randomSymbol(),
    orderId: randomNumber(),
    orderListId: -1,
    clientOrderId: randomString(),
    transactTime: new Date().valueOf(),
    price: '0.00000000',
    origQty: randomNumber(10, 100).toString(),
    executedQty: randomNumber(10, 100).toString(),
    cummulativeQuoteQty: randomNumber(10, 100).toString(),
    status: 'FILLED',
    timeInForce: 'GTC',
    type: 'MARKET',
    side: randomFromList(['BUY', 'SELL']),
    fills: [buildDefaultBinanceSendOrderOutputFill(), buildDefaultBinanceSendOrderOutputFill()],
  };
};

export const buildDefaultBinanceSendLimitOrderOutput = (): SendOrderOutput => {
  return {
    symbol: randomSymbol(),
    orderId: randomNumber(),
    orderListId: -1,
    clientOrderId: randomString(),
    transactTime: new Date().valueOf(),
    price: randomNumber(1, 1_000).toString(),
    origQty: randomNumber(10, 100).toString(),
    executedQty: '0.00000000',
    cummulativeQuoteQty: '0.00000000',
    status: 'NEW',
    timeInForce: 'GTC',
    type: 'LIMIT',
    side: randomFromList(['BUY', 'SELL']),
    fills: [],
  };
};

export const buildDefaultBinanceSendOrderOutputFill = (): SendOrderOutputFill => {
  return {
    price: randomNumber(1, 1_000).toString(),
    qty: randomNumber(10, 100).toString(),
    commission: randomNumber(1, 10).toString(),
    commissionAsset: randomString(5),
    tradeId: randomNumber(),
  };
};
