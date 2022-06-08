import { randomString, randomFromList, randomAsset } from '@hastobegood/crypto-bot-artillery/test/builders';

import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';

export const buildDefaultCoinListing = (): CoinListing => {
  return {
    id: randomString(),
    coin: randomAsset(),
    exchange: randomFromList(['Binance']),
    creationDate: new Date(),
    listingDate: new Date(),
    waitingDate: new Date(),
  };
};
