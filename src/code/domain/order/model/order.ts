export type OrderExchange = 'Binance';
export type OrderSide = 'Buy' | 'Sell';
export type OrderType = 'Market' | 'Limit';
export type OrderStatus = 'Waiting' | 'PartiallyFilled' | 'Filled' | 'Canceled' | 'Error' | 'Unknown';

export interface CreateOrder {
  exchange: OrderExchange;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quote: boolean;
  requestedQuantity: number;
  requestedPrice?: number;
}

export interface TransientOrder extends CreateOrder {
  id: string;
  status: OrderStatus;
  creationDate: Date;
}

export interface Order extends TransientOrder {
  externalId: string;
  externalStatus: string;
  transactionDate: Date;
  executedQuantity?: number;
  executedPrice?: number;
}
