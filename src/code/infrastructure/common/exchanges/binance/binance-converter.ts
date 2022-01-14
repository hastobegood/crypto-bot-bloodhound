import { extractAssets } from '../../../../configuration/util/symbol';
import { OrderSide as BinanceOrderSide, OrderStatus as BinanceOrderStatus, OrderType as BinanceOrderType } from '@hastobegood/crypto-clients-binance';
import { OrderSide, OrderStatus, OrderType } from '../../../../domain/order/model/order';

export const toBinanceSymbol = (symbol: string): string => {
  const assets = extractAssets(symbol);
  return `${assets.baseAsset}${assets.quoteAsset}`;
};

export const toBinanceOrderSide = (side: OrderSide): BinanceOrderSide => {
  switch (side) {
    case 'Buy':
      return 'BUY';
    case 'Sell':
      return 'SELL';
    default:
      throw new Error(`Unsupported '${side}' Binance order side`);
  }
};

export const toBinanceOrderType = (side: OrderType): BinanceOrderType => {
  switch (side) {
    case 'Market':
      return 'MARKET';
    case 'Limit':
      return 'LIMIT';
    default:
      throw new Error(`Unsupported '${side}' Binance order type`);
  }
};

export const fromBinanceOrderStatus = (status: BinanceOrderStatus): OrderStatus => {
  switch (status) {
    case 'NEW':
      return 'Waiting';
    case 'PARTIALLY_FILLED':
      return 'PartiallyFilled';
    case 'FILLED':
      return 'Filled';
    case 'PENDING_CANCEL':
    case 'CANCELED':
      return 'Canceled';
    case 'EXPIRED':
    case 'REJECTED':
      return 'Error';
    default:
      return 'Unknown';
  }
};
