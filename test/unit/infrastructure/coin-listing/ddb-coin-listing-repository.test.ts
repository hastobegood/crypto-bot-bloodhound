import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';
import { CoinListingEntity, DdbCoinListingRepository } from '../../../../src/code/infrastructure/coin-listing/ddb-coin-listing-repository';
import { buildDefaultCoinListing } from '../../../builders/domain/coin-listing/coin-listing-builder';
import { buildDefaultCoinListingEntity } from '../../../builders/infrastructure/coin-listing/coin-listing-entity-builder';

const ddbClientMock = jest.mocked(jest.genMockFromModule<DynamoDBDocumentClient>('@aws-sdk/lib-dynamodb'), true);

let coinListingRepository: DdbCoinListingRepository;
beforeEach(() => {
  ddbClientMock.send = jest.fn();

  coinListingRepository = new DdbCoinListingRepository('my-table', ddbClientMock);
});

describe('DdbCoinListingRepository', () => {
  describe('Given a coin listing to retrieve by its ID', () => {
    describe('When coin listing is not found', () => {
      beforeEach(() => {
        ddbClientMock.send.mockImplementation(() => ({
          Item: undefined,
        }));
      });

      it('Then null is returned', async () => {
        const result = await coinListingRepository.getById('123');
        expect(result).toBeNull();

        expect(ddbClientMock.send).toHaveBeenCalledTimes(1);
        const sendParams = ddbClientMock.send.mock.calls[0];
        expect(sendParams?.length).toEqual(1);
        expect(sendParams?.[0].input).toEqual({
          TableName: 'my-table',
          Key: {
            pk: 'CoinListing::123',
            sk: 'Details',
          },
        });
      });
    });

    describe('When coin listing is found', () => {
      let coinListingEntity: CoinListingEntity;

      beforeEach(() => {
        coinListingEntity = buildDefaultCoinListingEntity();
        ddbClientMock.send.mockImplementation(() => ({
          Item: {
            data: { ...coinListingEntity },
          },
        }));
      });

      it('Then coin listing is returned', async () => {
        const result = await coinListingRepository.getById('123');
        expect(result).toEqual({
          ...coinListingEntity,
          creationDate: new Date(coinListingEntity.creationDate),
          listingDate: new Date(coinListingEntity.listingDate),
          waitingDate: new Date(coinListingEntity.waitingDate),
        });

        expect(ddbClientMock.send).toHaveBeenCalledTimes(1);
        const sendParams = ddbClientMock.send.mock.calls[0];
        expect(sendParams?.length).toEqual(1);
        expect(sendParams?.[0].input).toEqual({
          TableName: 'my-table',
          Key: {
            pk: 'CoinListing::123',
            sk: 'Details',
          },
        });
      });
    });
  });

  describe('Given coin listings to save', () => {
    let coinListing1: CoinListing;
    let coinListing2: CoinListing;

    beforeEach(() => {
      coinListing1 = buildDefaultCoinListing();
      coinListing2 = buildDefaultCoinListing();
    });

    describe('When coin listings are saved', () => {
      it('Then coin listings are saved', async () => {
        await coinListingRepository.saveAll([coinListing1, coinListing2]);

        expect(ddbClientMock.send).toHaveBeenCalledTimes(1);
        const sendParams = ddbClientMock.send.mock.calls[0];
        expect(sendParams?.length).toEqual(1);
        expect(sendParams?.[0].input).toEqual({
          RequestItems: {
            'my-table': [
              {
                PutRequest: {
                  Item: {
                    pk: `CoinListing::${coinListing1.id}`,
                    sk: 'Details',
                    type: 'CoinListing',
                    data: {
                      ...coinListing1,
                      creationDate: coinListing1.creationDate.valueOf(),
                      listingDate: coinListing1.listingDate.valueOf(),
                      waitingDate: coinListing1.waitingDate.valueOf(),
                    },
                  },
                },
              },
              {
                PutRequest: {
                  Item: {
                    pk: `CoinListing::${coinListing2.id}`,
                    sk: 'Details',
                    type: 'CoinListing',
                    data: {
                      ...coinListing2,
                      creationDate: coinListing2.creationDate.valueOf(),
                      listingDate: coinListing2.listingDate.valueOf(),
                      waitingDate: coinListing2.waitingDate.valueOf(),
                    },
                  },
                },
              },
            ],
          },
        });
      });
    });
  });
});
