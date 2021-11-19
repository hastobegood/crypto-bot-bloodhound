import { mocked } from 'ts-jest/utils';
import { BinanceTickerClient } from '../../../../src/code/infrastructure/ticker/exchanges/binance/binance-ticker-client';
import { HttpTickerClient } from '../../../../src/code/infrastructure/ticker/http-ticker-client';
import { Ticker, TickerExchange } from '../../../../src/code/domain/ticker/model/ticker';
import { buildDefaultTicker } from '../../../builders/domain/ticker/ticker-test-builder';

const binanceTickerClientMock = mocked(jest.genMockFromModule<BinanceTickerClient>('../../../../src/code/infrastructure/ticker/exchanges/binance/binance-ticker-client'), true);

let tickerClient: HttpTickerClient;
beforeEach(() => {
  binanceTickerClientMock.getExchange = jest.fn();
  binanceTickerClientMock.getTickerBySymbol = jest.fn();

  tickerClient = new HttpTickerClient([binanceTickerClientMock]);
});

describe('HttpTickerClient', () => {
  beforeEach(() => {
    binanceTickerClientMock.getExchange.mockReturnValue('Binance');
  });

  describe('Given a ticker to retrieve for an exchange by its symbol', () => {
    describe('When exchange is unknown', () => {
      it('Then error is thrown', async () => {
        try {
          await tickerClient.getByExchangeAndSymbol('Unknown' as TickerExchange, 'ABC#DEF');
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual("Unsupported 'Unknown' exchange");
        }

        expect(binanceTickerClientMock.getExchange).toHaveBeenCalledTimes(1);
        const getExchangeParams = binanceTickerClientMock.getExchange.mock.calls[0];
        expect(getExchangeParams.length).toEqual(0);

        expect(binanceTickerClientMock.getTickerBySymbol).toHaveBeenCalledTimes(0);
      });
    });

    describe('When exchange is known', () => {
      let ticker: Ticker;

      beforeEach(() => {
        ticker = buildDefaultTicker();

        binanceTickerClientMock.getTickerBySymbol.mockResolvedValueOnce(ticker);
      });

      it('Then ticker is returned', async () => {
        const result = await tickerClient.getByExchangeAndSymbol('Binance', 'ABC#DEF');
        expect(result).toEqual(ticker);

        expect(binanceTickerClientMock.getExchange).toHaveBeenCalledTimes(1);
        const getExchangeParams = binanceTickerClientMock.getExchange.mock.calls[0];
        expect(getExchangeParams.length).toEqual(0);

        expect(binanceTickerClientMock.getTickerBySymbol).toHaveBeenCalledTimes(1);
        const getTickerBySymbolParams = binanceTickerClientMock.getTickerBySymbol.mock.calls[0];
        expect(getTickerBySymbolParams.length).toEqual(1);
        expect(getTickerBySymbolParams[0]).toEqual('ABC#DEF');
      });
    });

    describe('When ticker is cached', () => {
      let ticker: Ticker;

      beforeEach(() => {
        ticker = buildDefaultTicker();

        binanceTickerClientMock.getTickerBySymbol.mockResolvedValueOnce(ticker);
      });

      it('Then cached ticker is returned', async () => {
        const result1 = await tickerClient.getByExchangeAndSymbol('Binance', 'ABC#DEF');
        expect(result1).toEqual(ticker);
        const result2 = await tickerClient.getByExchangeAndSymbol('Binance', 'ABC#DEF');
        expect(result2).toEqual(ticker);

        expect(binanceTickerClientMock.getExchange).toHaveBeenCalledTimes(1);
        const getExchangeParams = binanceTickerClientMock.getExchange.mock.calls[0];
        expect(getExchangeParams.length).toEqual(0);

        expect(binanceTickerClientMock.getTickerBySymbol).toHaveBeenCalledTimes(1);
        const getTickerBySymbolParams = binanceTickerClientMock.getTickerBySymbol.mock.calls[0];
        expect(getTickerBySymbolParams.length).toEqual(1);
        expect(getTickerBySymbolParams[0]).toEqual('ABC#DEF');
      });
    });
  });
});
