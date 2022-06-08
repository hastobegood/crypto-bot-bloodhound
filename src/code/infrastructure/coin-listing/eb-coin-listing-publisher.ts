import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput, PutEventsRequestEntry } from '@aws-sdk/client-eventbridge';

import { CoinListingPublisher } from '../../domain/coin-listing/coin-listing-publisher';
import { CoinListing } from '../../domain/coin-listing/model/coin-listing';

export class EbCoinListingPublisher implements CoinListingPublisher {
  constructor(private ebClient: EventBridgeClient) {}

  async publishAll(coinListings: CoinListing[]): Promise<void> {
    if (coinListings.length) {
      const putEventsInput: PutEventsCommandInput = {
        Entries: coinListings.map((coinListing) => this.#buildEntry(coinListing)),
      };

      await this.ebClient.send(new PutEventsCommand(putEventsInput));
    }
  }

  #buildEntry(coinListing: CoinListing): PutEventsRequestEntry {
    return {
      Source: 'hastobegood.cryptobotbloodhound',
      DetailType: 'NewCoinListing',
      Detail: JSON.stringify(this.#buildEvent(coinListing)),
    };
  }

  #buildEvent(coinListing: CoinListing): CoinListingEvent {
    return {
      data: {
        ...coinListing,
        creationDate: coinListing.creationDate.toISOString(),
        listingDate: coinListing.listingDate.toISOString(),
        waitingDate: coinListing.waitingDate.toISOString(),
      },
    };
  }
}

export interface CoinListingEvent {
  data: Omit<CoinListing, 'creationDate' | 'listingDate' | 'waitingDate'> & { creationDate: string; listingDate: string; waitingDate: string };
}
