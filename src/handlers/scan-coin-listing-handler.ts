import 'source-map-support/register';
import { handleEvent } from '@hastobegood/crypto-bot-artillery/common';
import { Context, ScheduledEvent } from 'aws-lambda';

import { ScanCoinListingEventScheduler } from '../code/application/coin-listing/scan-coin-listing-event-scheduler';
import { ddbClient } from '../code/configuration/aws/dynamodb';
import { ebClient } from '../code/configuration/aws/eventbridge';
import { GetAnnouncementService } from '../code/domain/announcement/get-announcement-service';
import { ScanCoinListingService } from '../code/domain/coin-listing/scan-coin-listing-service';
import { BinanceAnnouncementClient } from '../code/infrastructure/announcement/exchanges/binance/binance-announcement-client';
import { HttpAnnouncementClient } from '../code/infrastructure/announcement/http-announcement-client';
import { DdbCoinListingRepository } from '../code/infrastructure/coin-listing/ddb-coin-listing-repository';
import { EbCoinListingPublisher } from '../code/infrastructure/coin-listing/eb-coin-listing-publisher';

const binanceAnnouncementClient = new BinanceAnnouncementClient();
const announcementClient = new HttpAnnouncementClient([binanceAnnouncementClient]);
const getAnnouncementService = new GetAnnouncementService(announcementClient);

const coinListingRepository = new DdbCoinListingRepository(process.env.COIN_LISTING_TABLE_NAME, ddbClient);
const coinListingPublisher = new EbCoinListingPublisher(ebClient);
const scanCoinListingService = new ScanCoinListingService(getAnnouncementService, coinListingRepository, coinListingPublisher);

const scanCoinListingEventScheduler = new ScanCoinListingEventScheduler(scanCoinListingService);

export const handler = async (_event: ScheduledEvent, context: Context): Promise<void> => {
  return handleEvent(context, async () => scanCoinListingEventScheduler.process());
};
