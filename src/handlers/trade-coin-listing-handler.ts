import { Context, EventBridgeEvent } from 'aws-lambda';
import { smClient } from '../code/configuration/aws/secrets-manager';
import { handleEvent } from './handler-utils';
import { BinanceAuthentication } from '../code/infrastructure/common/exchanges/binance/binance-authentication';
import { Client } from '@hastobegood/crypto-clients-binance';
import { BinanceTickerClient } from '../code/infrastructure/ticker/exchanges/binance/binance-ticker-client';
import { HttpTickerClient } from '../code/infrastructure/ticker/http-ticker-client';
import { GetTickerService } from '../code/domain/ticker/get-ticker-service';
import { BinanceOrderClient } from '../code/infrastructure/order/exchanges/binance/binance-order-client';
import { HttpOrderClient } from '../code/infrastructure/order/http-order-client';
import { CreateOrderService } from '../code/domain/order/create-order-service';
import { TradeCoinListingService } from '../code/domain/coin-listing/trade-coin-listing-service';
import { TradeCoinListingRecordConsumer } from '../code/application/coin-listing/trade-coin-listing-record-consumer';
import { CoinListingEvent } from '../code/infrastructure/coin-listing/eb-coin-listing-publisher';

const binanceAuthentication = new BinanceAuthentication(process.env.EXCHANGES_SECRET_NAME, smClient);
const binanceClient = new Client(binanceAuthentication);

const binanceTickerClient = new BinanceTickerClient(binanceClient);
const tickerClient = new HttpTickerClient([binanceTickerClient]);
const getTickerService = new GetTickerService(tickerClient);

const binanceOrderClient = new BinanceOrderClient(binanceClient);
const orderClient = new HttpOrderClient([binanceOrderClient]);
const createOrderService = new CreateOrderService(getTickerService, orderClient);

const tradeCoinListingService = new TradeCoinListingService(process.env.QUOTE_ASSET, process.env.QUOTE_ASSET_QUANTITY, process.env.RETRY_INTERVAL_MILLISECONDS, createOrderService);

const tradeCoinListingRecordConsumer = new TradeCoinListingRecordConsumer(tradeCoinListingService);

export const handler = async (event: EventBridgeEvent<'NewCoinListing', CoinListingEvent>, context: Context): Promise<void> => {
  return handleEvent(context, async () => tradeCoinListingRecordConsumer.process(event));
};
