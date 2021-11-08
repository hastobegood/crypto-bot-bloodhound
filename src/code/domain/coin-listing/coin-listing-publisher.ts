import { CoinListing } from './model/coin-listing';

export interface CoinListingPublisher {
  publishAll(coinListings: CoinListing[]): Promise<void>;
}
