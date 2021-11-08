import { BatchWriteCommand, BatchWriteCommandInput, DynamoDBDocumentClient, GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { CoinListingRepository } from '../../domain/coin-listing/coin-listing-repository';
import { CoinListing } from '../../domain/coin-listing/model/coin-listing';
import { chunk } from 'lodash';

export class DdbCoinListingRepository implements CoinListingRepository {
  constructor(private tableName: string, private ddbClient: DynamoDBDocumentClient) {}

  async getById(id: string): Promise<CoinListing | null> {
    const getInput: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        pk: `CoinListing::${id}`,
        sk: 'Details',
      },
    };

    const getOutput = await this.ddbClient.send(new GetCommand(getInput));

    return getOutput.Item ? this.#convertFromItemFormat(getOutput.Item.data) : null;
  }

  async saveAll(coinListings: CoinListing[]): Promise<void> {
    const items = coinListings.map((coinListing) => this.#buildItem(coinListing));

    await Promise.all(
      chunk(items, 25).map((chunk) => {
        const batchWriteInput: BatchWriteCommandInput = {
          RequestItems: {
            [this.tableName]: chunk,
          },
        };

        return this.ddbClient.send(new BatchWriteCommand(batchWriteInput));
      }),
    );
  }

  #buildItem(coinListing: CoinListing): any {
    return {
      PutRequest: {
        Item: {
          pk: `CoinListing::${coinListing.id}`,
          sk: 'Details',
          type: 'CoinListing',
          data: this.#convertToItemFormat(coinListing),
        },
      },
    };
  }

  #convertToItemFormat(coinListing: CoinListing): CoinListingEntity {
    return {
      ...coinListing,
      creationDate: coinListing.creationDate.valueOf(),
      listingDate: coinListing.listingDate.valueOf(),
      waitingDate: coinListing.waitingDate.valueOf(),
    };
  }

  #convertFromItemFormat(coinListingEntity: CoinListingEntity): CoinListing {
    return {
      ...coinListingEntity,
      creationDate: new Date(coinListingEntity.creationDate),
      listingDate: new Date(coinListingEntity.listingDate),
      waitingDate: new Date(coinListingEntity.waitingDate),
    };
  }
}

export interface CoinListingEntity extends Omit<CoinListing, 'creationDate' | 'listingDate' | 'waitingDate'> {
  creationDate: number;
  listingDate: number;
  waitingDate: number;
}
