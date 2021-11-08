import { Context, EventBridgeEvent } from 'aws-lambda';
import { snsClient } from '../code/configuration/aws/sns';
import { handleEvent } from './handler-utils';
import { CoinListingEvent } from '../code/infrastructure/coin-listing/eb-coin-listing-publisher';
import { SnsCoinListingNotifier } from '../code/infrastructure/coin-listing/sns-coin-listing-notifier';
import { NotifyCoinListingService } from '../code/domain/coin-listing/notify-coin-listing-service';
import { NotifyCoinListingRecordConsumer } from '../code/application/coin-listing/notify-coin-listing-record-consumer';

const phoneNumbers = process.env.PHONE_NUMBERS.split(',');

const coinListingNotifier = new SnsCoinListingNotifier(phoneNumbers, snsClient);
const notifyCoinListingService = new NotifyCoinListingService(coinListingNotifier);

const notifyCoinListingRecordConsumer = new NotifyCoinListingRecordConsumer(notifyCoinListingService);

export const handler = async (event: EventBridgeEvent<'NewCoinListing', CoinListingEvent>, context: Context): Promise<void> => {
  return handleEvent(context, async () => notifyCoinListingRecordConsumer.process(event));
};
