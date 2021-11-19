import { mocked } from 'ts-jest/utils';
import { TickerClient } from '../../../../src/code/domain/ticker/ticker-client';
import { GetTickerService } from '../../../../src/code/domain/ticker/get-ticker-service';
import { Ticker } from '../../../../src/code/domain/ticker/model/ticker';
import { buildDefaultTicker } from '../../../builders/domain/ticker/ticker-test-builder';

const tickerClientMock = mocked(jest.genMockFromModule<TickerClient>('../../../../src/code/domain/ticker/ticker-client'), true);

let getTickerService: GetTickerService;
beforeEach(() => {
  tickerClientMock.getByExchangeAndSymbol = jest.fn();

  getTickerService = new GetTickerService(tickerClientMock);
});

describe('GetTickerService', () => {
  describe('Given a ticker to retrieve for an exchange by its symbol', () => {
    describe('When ticker is found', () => {
      let ticker: Ticker;

      beforeEach(() => {
        ticker = buildDefaultTicker();
        tickerClientMock.getByExchangeAndSymbol.mockResolvedValue(ticker);
      });

      it('Then ticker is returned', async () => {
        const result = await getTickerService.getByExchangeAndSymbol('Binance', 'ABC');
        expect(result).toEqual(ticker);

        expect(tickerClientMock.getByExchangeAndSymbol).toHaveBeenCalledTimes(1);
        const getByExchangeAndSymbolParams = tickerClientMock.getByExchangeAndSymbol.mock.calls[0];
        expect(getByExchangeAndSymbolParams.length).toEqual(2);
        expect(getByExchangeAndSymbolParams[0]).toEqual('Binance');
        expect(getByExchangeAndSymbolParams[1]).toEqual('ABC');
      });
    });
  });
});
