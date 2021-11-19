export type CoinListingExchange = 'Binance';

export interface CoinListing {
  id: string;
  coin: string;
  exchange: CoinListingExchange;
  creationDate: Date;
  listingDate: Date;
  waitingDate: Date;
}
