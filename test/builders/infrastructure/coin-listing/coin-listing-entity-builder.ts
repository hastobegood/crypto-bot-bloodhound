import { CoinListingEntity } from '../../../../src/code/infrastructure/coin-listing/ddb-coin-listing-repository';
import { buildDefaultCoinListing } from '../../domain/coin-listing/coin-listing-builder';

export const buildDefaultCoinListingEntity = (): CoinListingEntity => {
  return {
    ...buildDefaultCoinListing(),
    creationDate: new Date().valueOf(),
    listingDate: new Date().valueOf(),
    waitingDate: new Date().valueOf(),
  };
};
