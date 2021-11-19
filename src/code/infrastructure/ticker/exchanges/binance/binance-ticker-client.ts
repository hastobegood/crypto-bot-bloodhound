import { ExchangeTickerClient } from '../exchange-ticker-client';
import { Ticker, TickerExchange } from '../../../../domain/ticker/model/ticker';
import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '../../../../configuration/http/axios';
import { BinanceExchangeInfo } from '../../../common/exchanges/binance/model/binance-exchange-info';
import { toBinanceSymbol } from '../../../common/exchanges/binance/binance-converter';

export class BinanceTickerClient implements ExchangeTickerClient {
  constructor(private url: string) {}

  getExchange(): TickerExchange {
    return 'Binance';
  }

  async getTickerBySymbol(symbol: string): Promise<Ticker> {
    const queryParameters = `symbol=${toBinanceSymbol(symbol)}`;
    const queryUrl = `/v3/exchangeInfo?${queryParameters}`;
    const queryConfig = this.#getQueryConfig();
    const response = await axiosInstance.get<BinanceExchangeInfo>(queryUrl, queryConfig);

    return {
      exchange: 'Binance',
      symbol: symbol,
      baseAssetPrecision: response.data.symbols[0].baseAssetPrecision,
      quoteAssetPrecision: response.data.symbols[0].quoteAssetPrecision,
      quantityPrecision: this.#extractPrecision(response.data.symbols[0].filters.find((filter) => filter.filterType === 'LOT_SIZE')!.stepSize!),
      pricePrecision: this.#extractPrecision(response.data.symbols[0].filters.find((filter) => filter.filterType === 'PRICE_FILTER')!.tickSize!),
    };
  }

  #getQueryConfig(): AxiosRequestConfig {
    return {
      baseURL: this.url,
    };
  }

  #extractPrecision(value: string): number {
    return (+value).toString().split('.')[1]?.length || 0;
  }
}
