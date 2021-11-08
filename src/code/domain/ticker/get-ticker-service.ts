import { Ticker, TickerExchange } from './model/ticker';
import { TickerClient } from './ticker-client';

export class GetTickerService {
  constructor(private tickerClient: TickerClient) {}

  async getByExchangeAndSymbol(exchange: TickerExchange, symbol: string): Promise<Ticker> {
    return this.tickerClient.getByExchangeAndSymbol(exchange, symbol);
  }
}
