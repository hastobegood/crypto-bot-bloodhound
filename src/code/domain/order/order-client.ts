import { Order, TransientOrder } from './model/order';

export interface OrderClient {
  send(transientOrder: TransientOrder): Promise<Order>;
}
