import { mocked } from 'ts-jest/utils';
import { buildDefaultCoinListing } from '../../../builders/domain/coin-listing/coin-listing-builder';
import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { EbCoinListingPublisher } from '../../../../src/code/infrastructure/coin-listing/eb-coin-listing-publisher';

const ebClientMock = mocked(jest.genMockFromModule<EventBridgeClient>('@aws-sdk/client-eventbridge'), true);

let coinListingPublisher: EbCoinListingPublisher;
beforeEach(() => {
  ebClientMock.send = jest.fn();

  coinListingPublisher = new EbCoinListingPublisher(ebClientMock);
});

describe('EbCoinListingPublisher', () => {
  describe('Given coin listings to publish', () => {
    let coinListing1: CoinListing;
    let coinListing2: CoinListing;

    beforeEach(() => {
      coinListing1 = buildDefaultCoinListing();
      coinListing2 = buildDefaultCoinListing();
    });

    describe('When empty list', () => {
      it('Then coin listings are not published', async () => {
        await coinListingPublisher.publishAll([]);

        expect(ebClientMock.send).toHaveBeenCalledTimes(0);
      });
    });

    describe('When multiple coin listings', () => {
      it('Then coin listings are published', async () => {
        await coinListingPublisher.publishAll([coinListing1, coinListing2]);

        expect(ebClientMock.send).toHaveBeenCalledTimes(1);
        const sendParams = ebClientMock.send.mock.calls[0];
        expect(sendParams.length).toEqual(1);
        expect(sendParams[0].input).toEqual({
          Entries: [
            {
              Source: 'hastobegood.cryptobotbloodhound',
              DetailType: 'NewCoinListing',
              Detail: JSON.stringify({ data: coinListing1 }),
            },
            {
              Source: 'hastobegood.cryptobotbloodhound',
              DetailType: 'NewCoinListing',
              Detail: JSON.stringify({ data: coinListing2 }),
            },
          ],
        });
      });
    });
  });
});
