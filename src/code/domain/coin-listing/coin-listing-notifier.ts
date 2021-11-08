import { CoinListing } from './model/coin-listing';

export interface CoinListingNotifier {
  notify(coinListing: CoinListing): Promise<void>;
}
