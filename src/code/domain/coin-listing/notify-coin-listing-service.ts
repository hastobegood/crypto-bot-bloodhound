import { CoinListing } from './model/coin-listing';
import { CoinListingNotifier } from './coin-listing-notifier';

export class NotifyCoinListingService {
  constructor(private coinListingNotifier: CoinListingNotifier) {}

  async notify(coinListing: CoinListing): Promise<void> {
    await this.coinListingNotifier.notify(coinListing);
  }
}
