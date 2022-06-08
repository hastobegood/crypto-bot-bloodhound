import { logger } from '@hastobegood/crypto-bot-artillery/common';
import { Order } from '@hastobegood/crypto-bot-artillery/order';

import { CreateOrderService } from '../order/create-order-service';
import { CreateOrder } from '../order/model/order';

import { CoinListing } from './model/coin-listing';

export class TradeCoinListingService {
  constructor(private quoteAsset: string, private quoteAssetQuantity: number, private retryIntervalMilliseconds: number, private createOrderService: CreateOrderService) {}

  async trade(coinListing: CoinListing): Promise<void> {
    if (new Date().valueOf() > coinListing.listingDate.valueOf()) {
      throw new Error('Listing date has passed');
    }

    const buyOrder = await this.#order(this.#buildBuyMarketOrder(coinListing));
    const sellOrder = await this.#order(this.#buildSellLimitOrder(coinListing, buyOrder));
    logger.info({ buyOrder: buyOrder, sellOrder: sellOrder }, 'Buy and sell orders created');
  }

  #buildBuyMarketOrder(coinListing: CoinListing): CreateOrder {
    return {
      exchange: coinListing.exchange,
      symbol: `${coinListing.coin}#${this.quoteAsset}`,
      side: 'Buy',
      type: 'Market',
      quote: true,
      requestedQuantity: this.quoteAssetQuantity,
    };
  }

  #buildSellLimitOrder(coinListing: CoinListing, buyOrder: Order): CreateOrder {
    return {
      exchange: coinListing.exchange,
      symbol: `${coinListing.coin}#${this.quoteAsset}`,
      side: 'Sell',
      type: 'Limit',
      quote: false,
      requestedQuantity: buyOrder.executedQuantity!,
      requestedPrice: buyOrder.executedPrice! * 1.5,
    };
  }

  async #order(createOrder: CreateOrder): Promise<Order> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        return await this.createOrderService.create(createOrder);
      } catch (error) {
        logger.child({ err: error }).error(createOrder, 'Unable to trade coin');
        await new Promise((resolve) => setTimeout(resolve, this.retryIntervalMilliseconds));
      }
    }
  }
}
