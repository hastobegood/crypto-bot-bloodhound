import { CoinListingNotifier } from './coin-listing-notifier';
import { CoinListing } from './model/coin-listing';

export class NotifyCoinListingService {
  constructor(private coinListingNotifier: CoinListingNotifier) {}

  async notify(coinListing: CoinListing): Promise<void> {
    await this.coinListingNotifier.notify(coinListing);
  }
}
