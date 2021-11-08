import { randomFromList, randomString } from '../../random-test-builder';
import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';

export const buildDefaultCoinListings = (): CoinListing[] => {
  return [buildDefaultCoinListing(), buildDefaultCoinListing(), buildDefaultCoinListing()];
};

export const buildDefaultCoinListing = (): CoinListing => {
  return {
    id: randomString(10),
    coin: randomString(5),
    exchange: randomFromList(['Binance']),
    creationDate: new Date(),
    listingDate: new Date(),
    waitingDate: new Date(),
  };
};
