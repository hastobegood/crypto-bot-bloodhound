import { logger } from '../../configuration/log/logger';
import { EventBridgeEvent } from 'aws-lambda';
import { CoinListingEvent } from '../../infrastructure/coin-listing/eb-coin-listing-publisher';
import { NotifyCoinListingService } from '../../domain/coin-listing/notify-coin-listing-service';
import { CoinListing } from '../../domain/coin-listing/model/coin-listing';

export class NotifyCoinListingRecordConsumer {
  constructor(private notifyCoinListingService: NotifyCoinListingService) {}

  async process(event: EventBridgeEvent<'NewCoinListing', CoinListingEvent>): Promise<void> {
    try {
      logger.info(event, 'Notifying coin listing');
      await this.notifyCoinListingService.notify(this.#buildCoinListing(event.detail));
      logger.info(event, 'Coin listing notified');
    } catch (error) {
      logger.error(event, 'Unable to notify coin listing');
      throw error;
    }
  }

  #buildCoinListing(coinListingEvent: CoinListingEvent): CoinListing {
    return {
      ...coinListingEvent.data,
      creationDate: new Date(coinListingEvent.data.creationDate),
      listingDate: new Date(coinListingEvent.data.listingDate),
      waitingDate: new Date(coinListingEvent.data.waitingDate),
    };
  }
}
