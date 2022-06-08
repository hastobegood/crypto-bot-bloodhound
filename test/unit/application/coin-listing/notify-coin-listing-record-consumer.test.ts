import { EventBridgeEvent } from 'aws-lambda/trigger/eventbridge';

import { NotifyCoinListingRecordConsumer } from '../../../../src/code/application/coin-listing/notify-coin-listing-record-consumer';
import { NotifyCoinListingService } from '../../../../src/code/domain/coin-listing/notify-coin-listing-service';
import { CoinListingEvent } from '../../../../src/code/infrastructure/coin-listing/eb-coin-listing-publisher';
import { buildDefaultCoinListingEvent } from '../../../builders/infrastructure/coin-listing/coin-listing-event-builder';

const notifyCoinListingServiceMock = jest.mocked(jest.genMockFromModule<NotifyCoinListingService>('../../../../src/code/domain/coin-listing/notify-coin-listing-service'), true);

let notifyCoinListingRecordConsumer: NotifyCoinListingRecordConsumer;
beforeEach(() => {
  notifyCoinListingServiceMock.notify = jest.fn();

  notifyCoinListingRecordConsumer = new NotifyCoinListingRecordConsumer(notifyCoinListingServiceMock);
});

describe('NotifyCoinListingRecordConsumer', () => {
  describe('Given a coin listing to notify', () => {
    let coinListingEvent: CoinListingEvent;

    beforeEach(() => {
      coinListingEvent = buildDefaultCoinListingEvent();
    });

    describe('When notification has failed', () => {
      beforeEach(() => {
        notifyCoinListingServiceMock.notify.mockRejectedValue(new Error('Error occurred !'));
      });

      it('Then error is thrown', async () => {
        try {
          await notifyCoinListingRecordConsumer.process(buildEventBridgeEvent(coinListingEvent));
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual('Error occurred !');
        }

        expect(notifyCoinListingServiceMock.notify).toHaveBeenCalledTimes(1);
        const notifyParams = notifyCoinListingServiceMock.notify.mock.calls[0];
        expect(notifyParams?.length).toEqual(1);
        expect(notifyParams?.[0]).toEqual({
          ...coinListingEvent.data,
          creationDate: new Date(coinListingEvent.data.creationDate),
          listingDate: new Date(coinListingEvent.data.listingDate),
          waitingDate: new Date(coinListingEvent.data.waitingDate),
        });
      });
    });

    describe('When notification has succeeded', () => {
      beforeEach(() => {
        notifyCoinListingServiceMock.notify = jest.fn().mockReturnValue({});
      });

      it('Then nothing is returned', async () => {
        await notifyCoinListingRecordConsumer.process(buildEventBridgeEvent(coinListingEvent));

        expect(notifyCoinListingServiceMock.notify).toHaveBeenCalledTimes(1);
        const notifyParams = notifyCoinListingServiceMock.notify.mock.calls[0];
        expect(notifyParams?.length).toEqual(1);
        expect(notifyParams?.[0]).toEqual({
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
