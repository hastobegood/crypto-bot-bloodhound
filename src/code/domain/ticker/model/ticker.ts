export type TickerExchange = 'Binance';

export interface Ticker {
  exchange: TickerExchange;
  symbol: string;
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  quantityPrecision: number;
  pricePrecision: number;
}
