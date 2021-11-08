import { Ticker, TickerExchange } from './model/ticker';

export interface TickerClient {
  getByExchangeAndSymbol(exchange: TickerExchange, symbol: string): Promise<Ticker>;
}
