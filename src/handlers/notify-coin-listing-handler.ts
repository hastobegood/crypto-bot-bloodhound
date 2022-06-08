import 'source-map-support/register';
import { handleEvent } from '@hastobegood/crypto-bot-artillery/common';
import { Context, EventBridgeEvent } from 'aws-lambda';

import { NotifyCoinListingRecordConsumer } from '../code/application/coin-listing/notify-coin-listing-record-consumer';
import { snsClient } from '../code/configuration/aws/sns';
import { NotifyCoinListingService } from '../code/domain/coin-listing/notify-coin-listing-service';
import { CoinListingEvent } from '../code/infrastructure/coin-listing/eb-coin-listing-publisher';
import { SnsCoinListingNotifier } from '../code/infrastructure/coin-listing/sns-coin-listing-notifier';

const phoneNumbers = process.env.PHONE_NUMBERS.split(',');

const coinListingNotifier = new SnsCoinListingNotifier(phoneNumbers, snsClient);
const notifyCoinListingService = new NotifyCoinListingService(coinListingNotifier);

const notifyCoinListingRecordConsumer = new NotifyCoinListingRecordConsumer(notifyCoinListingService);

export const handler = async (event: EventBridgeEvent<'NewCoinListing', CoinListingEvent>, context: Context): Promise<void> => {
  return handleEvent(context, async () => notifyCoinListingRecordConsumer.process(event));
};
