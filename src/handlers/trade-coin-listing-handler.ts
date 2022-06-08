import 'source-map-support/register';
import { loadExchangesClients } from '@hastobegood/crypto-bot-artillery';
import { handleEvent } from '@hastobegood/crypto-bot-artillery/common';
import { loadSendOrderClient } from '@hastobegood/crypto-bot-artillery/order';
import { loadFetchTickerClient } from '@hastobegood/crypto-bot-artillery/ticker';
import { Context, EventBridgeEvent } from 'aws-lambda';

import { TradeCoinListingRecordConsumer } from '../code/application/coin-listing/trade-coin-listing-record-consumer';
import { smClient } from '../code/configuration/aws/secrets-manager';
import { TradeCoinListingService } from '../code/domain/coin-listing/trade-coin-listing-service';
import { CreateOrderService } from '../code/domain/order/create-order-service';
import { CoinListingEvent } from '../code/infrastructure/coin-listing/eb-coin-listing-publisher';
import { BinanceAuthentication } from '../code/infrastructure/common/exchanges/binance/binance-authentication';

const binanceAuthentication = new BinanceAuthentication(process.env.EXCHANGES_SECRET_NAME, smClient);
const exchangesClients = loadExchangesClients({ binanceApiInfoProvider: binanceAuthentication });
const fetchTickerClient = loadFetchTickerClient(exchangesClients, 0);
const sendOrderClient = loadSendOrderClient(exchangesClients, fetchTickerClient);

const createOrderService = new CreateOrderService(sendOrderClient);

const tradeCoinListingService = new TradeCoinListingService(process.env.QUOTE_ASSET, process.env.QUOTE_ASSET_QUANTITY, process.env.RETRY_INTERVAL_MILLISECONDS, createOrderService);

const tradeCoinListingRecordConsumer = new TradeCoinListingRecordConsumer(tradeCoinListingService);

export const handler = async (event: EventBridgeEvent<'NewCoinListing', CoinListingEvent>, context: Context): Promise<void> => {
  return handleEvent(context, async () => tradeCoinListingRecordConsumer.process(event));
};
