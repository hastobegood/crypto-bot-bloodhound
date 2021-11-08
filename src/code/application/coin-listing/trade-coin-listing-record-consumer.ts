import { logger } from '../../configuration/log/logger';
import { EventBridgeEvent } from 'aws-lambda';
import { CoinListingEvent } from '../../infrastructure/coin-listing/eb-coin-listing-publisher';
import { CoinListing } from '../../domain/coin-listing/model/coin-listing';
import { TradeCoinListingService } from '../../domain/coin-listing/trade-coin-listing-service';

export class TradeCoinListingRecordConsumer {
  constructor(private tradeCoinListingService: TradeCoinListingService) {}

  async process(event: EventBridgeEvent<'NewCoinListing', CoinListingEvent>): Promise<void> {
    try {
      logger.info(event, 'Trading coin listing');
      await this.tradeCoinListingService.trade(this.#buildCoinListing(event.detail));
      logger.info(event, 'Coin listing traded');
    } catch (error) {
      logger.error(event, 'Unable to trade coin listing');
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
