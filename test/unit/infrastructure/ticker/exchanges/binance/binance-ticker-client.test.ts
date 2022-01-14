import { mocked } from 'ts-jest/utils';
import {
  buildBinanceGetExchangeInfoOutputSymbolLotSizeFilter,
  buildBinanceGetExchangeInfoOutputSymbolPriceFilter,
  buildDefaultBinanceGetExchangeInfoOutput,
} from '../../../../../builders/infrastructure/common/exchanges/binance/binance-ticker-test-builder';
import { Client, GetExchangeInfoOutput } from '@hastobegood/crypto-clients-binance';
import { BinanceTickerClient } from '../../../../../../src/code/infrastructure/ticker/exchanges/binance/binance-ticker-client';

const clientMock = mocked(jest.genMockFromModule<Client>('@hastobegood/crypto-clients-binance'), true);

let binanceTickerClient: BinanceTickerClient;
beforeEach(() => {
  clientMock.send = jest.fn();

  binanceTickerClient = new BinanceTickerClient(clientMock);
});

describe('BinanceTickerClient', () => {
  describe('Given the exchange to retrieve', () => {
    it('Then Binance exchange is returned', async () => {
      expect(binanceTickerClient.getExchange()).toEqual('Binance');
    });
  });

  describe('Given a ticker to retrieve by its symbol', () => {
    let getExchangeInfoOutput: GetExchangeInfoOutput;

    describe('When ticker is found', () => {
      beforeEach(() => {
        getExchangeInfoOutput = buildDefaultBinanceGetExchangeInfoOutput();
        getExchangeInfoOutput.symbols[0].filters = [buildBinanceGetExchangeInfoOutputSymbolLotSizeFilter('0.00000100'), buildBinanceGetExchangeInfoOutputSymbolPriceFilter('1.00000000')];

        clientMock.send.mockResolvedValueOnce({
          status: 200,
          headers: {},
          data: getExchangeInfoOutput,
        });
      });

      it('Then ticker is returned', async () => {
        const result = await binanceTickerClient.getTickerBySymbol('ABC#DEF');
        expect(result).toEqual({
          exchange: 'Binance',
          symbol: 'ABC#DEF',
          baseAssetPrecision: getExchangeInfoOutput.symbols[0].baseAssetPrecision,
          quoteAssetPrecision: getExchangeInfoOutput.symbols[0].quoteAssetPrecision,
          quantityPrecision: 6,
          pricePrecision: 0,
        });

        expect(clientMock.send).toHaveBeenCalledTimes(1);
        const sendParams = clientMock.send.mock.calls[0];
        expect(sendParams.length).toEqual(1);
        expect(sendParams[0]).toEqual({
          input: {
            symbol: 'ABCDEF',
          },
        });
      });
    });
  });
});
