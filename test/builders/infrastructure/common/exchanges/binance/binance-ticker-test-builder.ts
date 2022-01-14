import { randomBoolean, randomFromList, randomNumber, randomString, randomSymbol } from '../../../../random-test-builder';
import { GetExchangeInfoOutput, GetExchangeInfoOutputRateLimit, GetExchangeInfoOutputSymbol, GetExchangeInfoOutputSymbolFilter } from '@hastobegood/crypto-clients-binance';

export const buildDefaultBinanceGetExchangeInfoOutput = (): GetExchangeInfoOutput => {
  return {
    timezone: 'UTC',
    serverTime: new Date().valueOf(),
    rateLimits: [buildDefaultBinanceGetExchangeInfoOutputRateLimit(), buildDefaultBinanceGetExchangeInfoOutputRateLimit()],
    symbols: [buildDefaultBinanceGetExchangeInfoOutputSymbol()],
  };
};

export const buildDefaultBinanceGetExchangeInfoOutputRateLimit = (): GetExchangeInfoOutputRateLimit => {
  return {
    rateLimitType: randomFromList(['REQUEST_WEIGHT', 'ORDERS', 'RAW_REQUESTS']),
    interval: randomFromList(['SECOND', 'MINUTE', 'DAY']),
    intervalNum: randomNumber(1, 60),
    limit: randomNumber(100, 500),
  };
};

export const buildDefaultBinanceGetExchangeInfoOutputSymbol = (): GetExchangeInfoOutputSymbol => {
  return {
    symbol: randomSymbol(),
    status: randomFromList(['PRE_TRADING', 'TRADING', 'POST_TRADING', 'END_OF_DAY', 'HALT', 'AUCTION_MATCH', 'BREAK']),
    baseAsset: randomString(5),
    baseAssetPrecision: randomNumber(8, 10),
    quoteAsset: randomString(5),
    quoteAssetPrecision: randomNumber(8, 10),
    baseCommissionPrecision: randomNumber(8, 10),
    quoteCommissionPrecision: randomNumber(8, 10),
    orderTypes: [randomString(5), randomString(5)],
    icebergAllowed: randomBoolean(),
    ocoAllowed: randomBoolean(),
    quoteOrderQtyMarketAllowed: randomBoolean(),
    isSpotTradingAllowed: randomBoolean(),
    isMarginTradingAllowed: randomBoolean(),
    filters: [buildDefaultBinanceGetExchangeInfoOutputSymbolFilter(), buildDefaultBinanceGetExchangeInfoOutputSymbolFilter()],
    permissions: [randomFromList(['SPOT', 'MARGIN']), randomFromList(['LEVERAGED', 'TRD_GRP_002'])],
  };
};

export const buildDefaultBinanceGetExchangeInfoOutputSymbolFilter = (): GetExchangeInfoOutputSymbolFilter => {
  const filterType = randomFromList<'PRICE_FILTER' | 'PERCENT_PRICE' | 'LOT_SIZE' | 'MIN_NOTIONAL' | 'ICEBERG_PARTS' | 'MARKET_LOT_SIZE' | 'MAX_NUM_ORDERS' | 'MAX_NUM_ALGO_ORDERS' | 'MAX_NUM_ICEBERG_ORDERS' | 'MAX_POSITION'>([
    'PRICE_FILTER',
    'PERCENT_PRICE',
    'LOT_SIZE',
    'MIN_NOTIONAL',
    'ICEBERG_PARTS',
    'MARKET_LOT_SIZE',
    'MAX_NUM_ORDERS',
    'MAX_NUM_ALGO_ORDERS',
    'MAX_NUM_ICEBERG_ORDERS',
    'MAX_POSITION',
  ]);

  switch (filterType) {
    case 'PRICE_FILTER':
      return {
        filterType: filterType,
        minPrice: randomNumber(1, 100).toString(),
        maxPrice: randomNumber(1_000, 10_000).toString(),
        tickSize: randomNumber(1, 4).toString(),
      };
    case 'PERCENT_PRICE':
      return {
        filterType: filterType,
        multiplierUp: randomNumber(1, 100).toString(),
        multiplierDown: randomNumber(1_000, 10_000).toString(),
        avgPriceMins: randomNumber(1, 10),
      };
    case 'LOT_SIZE':
    case 'MARKET_LOT_SIZE':
      return {
        filterType: filterType,
        minQty: randomNumber(1, 100).toString(),
        maxQty: randomNumber(1_000, 10_000).toString(),
        stepSize: randomNumber(1, 4).toString(),
      };
    case 'MIN_NOTIONAL':
      return {
        filterType: filterType,
        minNotional: randomNumber(1, 100).toString(),
        applyToMarket: randomBoolean(),
        avgPriceMins: randomNumber(1, 1_000).toString(),
      };
    case 'ICEBERG_PARTS':
      return {
        filterType: filterType,
        limit: randomNumber(1, 100),
      };
    case 'MAX_NUM_ORDERS':
      return {
        filterType: filterType,
        maxNumOrders: randomNumber(1, 100),
      };
    case 'MAX_NUM_ALGO_ORDERS':
      return {
        filterType: filterType,
        maxNumAlgoOrders: randomNumber(1, 100),
      };
    case 'MAX_NUM_ICEBERG_ORDERS':
      return {
        filterType: filterType,
        maxNumIcebergOrders: randomNumber(1, 100),
      };
    case 'MAX_POSITION':
      return {
        filterType: filterType,
        maxPosition: randomNumber(1, 100).toString(),
      };
  }
};

export const buildBinanceGetExchangeInfoOutputSymbolLotSizeFilter = (stepSize: string): GetExchangeInfoOutputSymbolFilter => {
  return {
    filterType: 'LOT_SIZE',
    minQty: randomNumber(1, 100).toString(),
    maxQty: randomNumber(1_000, 10_000).toString(),
    stepSize: stepSize,
  };
};

export const buildBinanceGetExchangeInfoOutputSymbolPriceFilter = (tickSize: string): GetExchangeInfoOutputSymbolFilter => {
  return {
    filterType: 'PRICE_FILTER',
    minPrice: randomNumber(1, 100).toString(),
    maxPrice: randomNumber(1_000, 10_000).toString(),
    tickSize: tickSize,
  };
};
