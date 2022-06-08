import { CoinListingEvent } from '../../../../src/code/infrastructure/coin-listing/eb-coin-listing-publisher';
import { buildDefaultCoinListing } from '../../domain/coin-listing/coin-listing-builder';

export const buildDefaultCoinListingEvent = (): CoinListingEvent => {
  return {
    data: {
      ...buildDefaultCoinListing(),
      creationDate: new Date().toISOString(),
      listingDate: new Date().toISOString(),
      waitingDate: new Date().toISOString(),
    },
  };
};
