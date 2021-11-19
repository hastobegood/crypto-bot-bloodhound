import { logger } from '../../configuration/log/logger';
import { CreateOrder, Order, TransientOrder } from './model/order';
import { truncate } from '../../configuration/util/math';
import { GetTickerService } from '../ticker/get-ticker-service';
import { OrderClient } from './order-client';

export class CreateOrderService {
  constructor(private getTickerService: GetTickerService, private orderClient: OrderClient) {}

  async create(createOrder: CreateOrder): Promise<Order> {
    const transientOrder = await this.#buildTransientOrder(createOrder);

    logger.info(transientOrder, 'Create order');
    const order = await this.orderClient.send(transientOrder);
    logger.info(order, 'Order created');

    return order;
  }

  async #buildTransientOrder(createOrder: CreateOrder): Promise<TransientOrder> {
    if (createOrder.type === 'Market' && createOrder.requestedPrice) {
      throw new Error('Unable to create a market order with price limit');
    }
    if (createOrder.type === 'Limit') {
      if (createOrder.quote) {
        throw new Error('Unable to create a limit order using quote asset quantity');
      }
      if (!createOrder.requestedPrice) {
        throw new Error('Unable to create a limit order without price limit');
      }
    }

    const creationDate = new Date();
    const ticker = await this.getTickerService.getByExchangeAndSymbol(createOrder.exchange, createOrder.symbol);

    return {
      ...createOrder,
      id: `${createOrder.exchange}/${createOrder.symbol}/${createOrder.side}/${createOrder.type}/${creationDate.valueOf()}`,
      status: 'Waiting',
      creationDate: creationDate,
      requestedQuantity: truncate(createOrder.requestedQuantity, createOrder.quote ? ticker.quoteAssetPrecision : ticker.quantityPrecision),
      requestedPrice: createOrder.requestedPrice ? truncate(createOrder.requestedPrice, ticker.pricePrecision) : undefined,
    };
  }
}
