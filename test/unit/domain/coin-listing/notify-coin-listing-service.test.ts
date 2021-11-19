import { mocked } from 'ts-jest/utils';
import { expect } from '@jest/globals';
import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';
import { buildDefaultCoinListing } from '../../../builders/domain/coin-listing/coin-listing-builder';
import { NotifyCoinListingService } from '../../../../src/code/domain/coin-listing/notify-coin-listing-service';
import { CoinListingNotifier } from '../../../../src/code/domain/coin-listing/coin-listing-notifier';

const coinListingNotifierMock = mocked(jest.genMockFromModule<CoinListingNotifier>('../../../../src/code/domain/coin-listing/coin-listing-notifier'), true);

let notifyCoinListingService: NotifyCoinListingService;
beforeEach(() => {
  coinListingNotifierMock.notify = jest.fn();

  notifyCoinListingService = new NotifyCoinListingService(coinListingNotifierMock);
});

describe('NotifyCoinListingService', () => {
  describe('Given a coin listing to notify', () => {
    let coinListing: CoinListing;

    beforeEach(() => {
      coinListing = buildDefaultCoinListing();
    });

    it('Then coin listing is notified', async () => {
      await notifyCoinListingService.notify(coinListing);

      expect(coinListingNotifierMock.notify).toHaveBeenCalledTimes(1);
      const notifyParams = coinListingNotifierMock.notify.mock.calls[0];
      expect(notifyParams.length).toEqual(1);
      expect(notifyParams[0]).toEqual(coinListing);
    });
  });
});
