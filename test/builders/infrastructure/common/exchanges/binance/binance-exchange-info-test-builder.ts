import { BinanceExchangeInfo, BinanceExchangeInfoFilter, BinanceExchangeInfoSymbol } from '../../../../../../src/code/infrastructure/common/exchanges/binance/model/binance-exchange-info';
import { randomFromList, randomNumber } from '../../../../random-test-builder';

export const buildDefaultBinanceExchangeInfo = (): BinanceExchangeInfo => {
  return {
    symbols: [buildDefaultBinanceExchangeInfoSymbol()],
  };
};

export const buildDefaultBinanceExchangeInfoSymbol = (): BinanceExchangeInfoSymbol => {
  return {
    baseAssetPrecision: randomNumber(8, 10),
    quoteAssetPrecision: randomNumber(8, 10),
    filters: [buildBinanceExchangeInfoLotSizeFilter(randomFromList(['0.1', '0.01', '0.001', '0.001', '0.0001'])), buildBinanceExchangeInfoPriceFilter(randomFromList(['0.1', '0.01', '0.001', '0.001', '0.0001']))],
  };
};

export const buildBinanceExchangeInfoLotSizeFilter = (stepSize: string): BinanceExchangeInfoFilter => {
  return {
    filterType: 'LOT_SIZE',
    stepSize: stepSize,
  };
};

export const buildBinanceExchangeInfoPriceFilter = (tickSize: string): BinanceExchangeInfoFilter => {
  return {
    filterType: 'PRICE_FILTER',
    tickSize: tickSize,
  };
};
