import { ExchangeOrderClient } from './exchanges/exchange-order-client';
import { OrderClient } from '../../domain/order/order-client';
import { Order, OrderExchange, TransientOrder } from '../../domain/order/model/order';

export class HttpOrderClient implements OrderClient {
  constructor(private exchangeOrderClients: ExchangeOrderClient[]) {}

  async send(transientOrder: TransientOrder): Promise<Order> {
    return this.#getExchangeOrderClient(transientOrder.exchange).sendOrder(transientOrder);
  }

  #getExchangeOrderClient(exchange: OrderExchange): ExchangeOrderClient {
    const exchangeOrderClient = this.exchangeOrderClients.find((exchangeOrderClients) => exchangeOrderClients.getExchange() === exchange);
    if (!exchangeOrderClient) {
      throw new Error(`Unsupported '${exchange}' exchange`);
    }
    return exchangeOrderClient;
  }
}
