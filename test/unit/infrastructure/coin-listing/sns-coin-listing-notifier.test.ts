import { mocked } from 'ts-jest/utils';
import { buildDefaultCoinListing } from '../../../builders/domain/coin-listing/coin-listing-builder';
import { SnsCoinListingNotifier } from '../../../../src/code/infrastructure/coin-listing/sns-coin-listing-notifier';
import { SNSClient } from '@aws-sdk/client-sns';
import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';

const snsClientMock = mocked(jest.genMockFromModule<SNSClient>('@aws-sdk/client-sns'), true);

let coinListingNotifier: SnsCoinListingNotifier;
beforeEach(() => {
  snsClientMock.send = jest.fn();

  coinListingNotifier = new SnsCoinListingNotifier(['phone1', 'phone2'], snsClientMock);
});

describe('SnsCoinListingNotifier', () => {
  describe('Given a coin listing to notify', () => {
    let coinListing: CoinListing;

    beforeEach(() => {
      coinListing = buildDefaultCoinListing();
    });

    describe('When no phone number', () => {
      beforeEach(() => {
        coinListingNotifier = new SnsCoinListingNotifier([], snsClientMock);
      });

      it('Then coin listing is not notified', async () => {
        await coinListingNotifier.notify(coinListing);

        expect(snsClientMock.send).toHaveBeenCalledTimes(0);
      });
    });

    describe('When multiple phone numbers', () => {
      it('Then coin listing is notified for each phone number', async () => {
        await coinListingNotifier.notify(coinListing);

        expect(snsClientMock.send).toHaveBeenCalledTimes(2);
        let sendParams = snsClientMock.send.mock.calls[0];
        expect(sendParams.length).toEqual(1);
        expect(sendParams[0].input).toEqual({
          Message: `${coinListing.exchange} will list ${coinListing.coin} at ${coinListing.listingDate.toISOString()}`,
          PhoneNumber: 'phone1',
        });
        sendParams = snsClientMock.send.mock.calls[1];
        expect(sendParams.length).toEqual(1);
        expect(sendParams[0].input).toEqual({
          Message: `${coinListing.exchange} will list ${coinListing.coin} at ${coinListing.listingDate.toISOString()}`,
          PhoneNumber: 'phone2',
        });
      });
    });
  });
});
