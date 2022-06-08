import { logger } from '@hastobegood/crypto-bot-artillery/common';

import { CoinListingExchange } from '../../domain/coin-listing/model/coin-listing';
import { ScanCoinListingService } from '../../domain/coin-listing/scan-coin-listing-service';

const exchanges: CoinListingExchange[] = ['Binance'];

export class ScanCoinListingEventScheduler {
  constructor(private coinListingService: ScanCoinListingService) {}

  async process(): Promise<void> {
    await Promise.all(
      exchanges.map(async (exchange) => {
        try {
          logger.info({ exchange: exchange }, 'Scanning coin listing');
          await this.coinListingService.scan(exchange);
          logger.info({ exchange: exchange }, 'Coin listing scanned');
        } catch (error) {
          logger.error({ exchange: exchange }, 'Unable to scan coin listing');
          throw error;
        }
      }),
    );
  }
}
