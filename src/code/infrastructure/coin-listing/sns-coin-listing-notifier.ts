import { PublishCommand, PublishCommandInput, SNSClient } from '@aws-sdk/client-sns';

import { CoinListingNotifier } from '../../domain/coin-listing/coin-listing-notifier';
import { CoinListing } from '../../domain/coin-listing/model/coin-listing';

export class SnsCoinListingNotifier implements CoinListingNotifier {
  constructor(private phoneNumbers: string[], private snsClient: SNSClient) {}

  async notify(coinListing: CoinListing): Promise<void> {
    await Promise.all(
      this.phoneNumbers.map((phoneNumber) => {
        const publishInput: PublishCommandInput = {
          Message: `${coinListing.exchange} will list ${coinListing.coin} at ${coinListing.listingDate.toISOString()}`,
          PhoneNumber: phoneNumber,
        };

        return this.snsClient.send(new PublishCommand(publishInput));
      }),
    );
  }
}
