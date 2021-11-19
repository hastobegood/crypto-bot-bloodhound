import { axiosInstance } from '../../../../../../src/code/configuration/http/axios';
import { mocked } from 'ts-jest/utils';
import { BinanceTickerClient } from '../../../../../../src/code/infrastructure/ticker/exchanges/binance/binance-ticker-client';
import { buildBinanceExchangeInfoLotSizeFilter, buildBinanceExchangeInfoPriceFilter, buildDefaultBinanceExchangeInfo } from '../../../../../builders/infrastructure/common/exchanges/binance/binance-exchange-info-test-builder';
import { BinanceExchangeInfo } from '../../../../../../src/code/infrastructure/common/exchanges/binance/model/binance-exchange-info';

jest.mock('../../../../../../src/code/configuration/http/axios');

const axiosInstanceMock = mocked(axiosInstance, true);

let binanceTickerClient: BinanceTickerClient;
beforeEach(() => {
  binanceTickerClient = new BinanceTickerClient('my-url');
});

describe('BinanceTickerClient', () => {
  describe('Given the exchange to retrieve', () => {
    it('Then Binance exchange is returned', async () => {
      expect(binanceTickerClient.getExchange()).toEqual('Binance');
    });
  });

  describe('Given a ticker to retrieve by its symbol', () => {
    let binanceExchangeInfo: BinanceExchangeInfo;

    describe('When ticker is found', () => {
      beforeEach(() => {
        binanceExchangeInfo = buildDefaultBinanceExchangeInfo();
        binanceExchangeInfo.symbols[0].filters = [buildBinanceExchangeInfoLotSizeFilter('0.00000100'), buildBinanceExchangeInfoPriceFilter('1.00000000')];

        axiosInstanceMock.get.mockResolvedValueOnce({
          data: binanceExchangeInfo,
        });
      });

      it('Then ticker is returned', async () => {
        const result = await binanceTickerClient.getTickerBySymbol('ABC#DEF');
        expect(result).toEqual({
          exchange: 'Binance',
          symbol: 'ABC#DEF',
          baseAssetPrecision: binanceExchangeInfo.symbols[0].baseAssetPrecision,
          quoteAssetPrecision: binanceExchangeInfo.symbols[0].quoteAssetPrecision,
          quantityPrecision: 6,
          pricePrecision: 0,
        });

        expect(axiosInstanceMock.get).toHaveBeenCalledTimes(1);
        const getParams = axiosInstanceMock.get.mock.calls[0];
        expect(getParams.length).toEqual(2);
        expect(getParams[0]).toEqual('/v3/exchangeInfo?symbol=ABCDEF');
        expect(getParams[1]).toEqual({
          baseURL: 'my-url',
        });
      });
    });
  });
});
