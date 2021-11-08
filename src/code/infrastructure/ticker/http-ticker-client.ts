import { TickerClient } from '../../domain/ticker/ticker-client';
import { ExchangeTickerClient } from './exchanges/exchange-ticker-client';
import { Ticker, TickerExchange } from '../../domain/ticker/model/ticker';
import { MemoryCache } from '../common/cache/memory-cache';

export class HttpTickerClient implements TickerClient {
  private cache: MemoryCache;

  constructor(private exchangeTickerClients: ExchangeTickerClient[]) {
    this.cache = new MemoryCache();
  }

  async getByExchangeAndSymbol(exchange: TickerExchange, symbol: string): Promise<Ticker> {
    const cacheKey = `${exchange}/${symbol}`;
    const cachedTicker = await this.cache.get<Ticker>(cacheKey);
    if (cachedTicker) {
      return cachedTicker;
    }

    return this.#getExchangeTickerClient(exchange)
      .getTickerBySymbol(symbol)
      .then(async (ticker) => {
        await this.cache.set<Ticker>(cacheKey, ticker);
        return ticker;
      });
  }

  #getExchangeTickerClient(exchange: TickerExchange): ExchangeTickerClient {
    const exchangeTickerClient = this.exchangeTickerClients.find((exchangeTickerClient) => exchangeTickerClient.getExchange() === exchange);
    if (!exchangeTickerClient) {
      throw new Error(`Unsupported '${exchange}' exchange`);
    }
    return exchangeTickerClient;
  }
}
