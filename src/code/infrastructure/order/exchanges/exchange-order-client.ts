import { Order, OrderExchange, TransientOrder } from '../../../domain/order/model/order';

export interface ExchangeOrderClient {
  getExchange(): OrderExchange;

  sendOrder(transientOrder: TransientOrder): Promise<Order>;
}
