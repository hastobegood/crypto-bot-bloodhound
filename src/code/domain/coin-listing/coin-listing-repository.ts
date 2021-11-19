import { CoinListing } from './model/coin-listing';

export interface CoinListingRepository {
  getById(id: string): Promise<CoinListing | null>;

  saveAll(coinListings: CoinListing[]): Promise<void>;
}
