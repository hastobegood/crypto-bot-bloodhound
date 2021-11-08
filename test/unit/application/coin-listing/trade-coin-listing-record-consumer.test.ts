import { mocked } from 'ts-jest/utils';
import { CoinListingEvent } from '../../../../src/code/infrastructure/coin-listing/eb-coin-listing-publisher';
import { buildDefaultCoinListingEvent } from '../../../builders/infrastructure/coin-listing/coin-listing-event-builder';
import { EventBridgeEvent } from 'aws-lambda/trigger/eventbridge';
import { TradeCoinListingRecordConsumer } from '../../../../src/code/application/coin-listing/trade-coin-listing-record-consumer';
import { TradeCoinListingService } from '../../../../src/code/domain/coin-listing/trade-coin-listing-service';

const tradeCoinListingServiceMock = mocked(jest.genMockFromModule<TradeCoinListingService>('../../../../src/code/domain/coin-listing/trade-coin-listing-service'), true);

let tradeCoinListingRecordConsumer: TradeCoinListingRecordConsumer;
beforeEach(() => {
  tradeCoinListingServiceMock.trade = jest.fn();

  tradeCoinListingRecordConsumer = new TradeCoinListingRecordConsumer(tradeCoinListingServiceMock);
});

describe('TradeCoinListingRecordConsumer', () => {
  describe('Given a coin listing to trade', () => {
    let coinListingEvent: CoinListingEvent;

    beforeEach(() => {
      coinListingEvent = buildDefaultCoinListingEvent();
    });

    describe('When trading has failed', () => {
      beforeEach(() => {
        tradeCoinListingServiceMock.trade.mockRejectedValue(new Error('Error occurred !'));
      });

      it('Then error is thrown', async () => {
        try {
          await tradeCoinListingRecordConsumer.process(buildEventBridgeEvent(coinListingEvent));
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual('Error occurred !');
        }

        expect(tradeCoinListingServiceMock.trade).toHaveBeenCalledTimes(1);
        const tradeParams = tradeCoinListingServiceMock.trade.mock.calls[0];
        expect(tradeParams.length).toEqual(1);
        expect(tradeParams[0]).toEqual({
          ...coinListingEvent.data,
          creationDate: new Date(coinListingEvent.data.creationDate),
          listingDate: new Date(coinListingEvent.data.listingDate),
          waitingDate: new Date(coinListingEvent.data.waitingDate),
        });
      });
    });

    describe('When trading has succeeded', () => {
      beforeEach(() => {
        tradeCoinListingServiceMock.trade = jest.fn().mockReturnValue({});
      });

      it('Then nothing is returned', async () => {
        await tradeCoinListingRecordConsumer.process(buildEventBridgeEvent(coinListingEvent));

        expect(tradeCoinListingServiceMock.trade).toHaveBeenCalledTimes(1);
        const tradeParams = tradeCoinListingServiceMock.trade.mock.calls[0];
        expect(tradeParams.length).toEqual(1);
        expect(tradeParams[0]).toEqual({
          ...coinListingEvent.data,
          creationDate: new Date(coinListingEvent.data.creationDate),
          listingDate: new Date(coinListingEvent.data.listingDate),
          waitingDate: new Date(coinListingEvent.data.waitingDate),
        });
      });
    });
  });
});

const buildEventBridgeEvent = (coinListingEvent: CoinListingEvent): EventBridgeEvent<'NewCoinListing', CoinListingEvent> => {
  return {
    detail: coinListingEvent,
  } as EventBridgeEvent<'NewCoinListing', CoinListingEvent>;
};
