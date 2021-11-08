import { Ticker, TickerExchange } from '../../../domain/ticker/model/ticker';

export interface ExchangeTickerClient {
  getExchange(): TickerExchange;

  getTickerBySymbol(symbol: string): Promise<Ticker>;
}
