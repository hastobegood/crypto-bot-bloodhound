import { ExchangeOrderClient } from '../exchange-order-client';
import { TickerExchange } from '../../../../domain/ticker/model/ticker';
import { Order, TransientOrder } from '../../../../domain/order/model/order';
import { fromBinanceOrderStatus, toBinanceOrderSide, toBinanceSymbol } from '../../../common/exchanges/binance/binance-converter';
import { BinanceAuthentication } from '../../../common/exchanges/binance/binance-authentication';
import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '../../../../configuration/http/axios';
import { BinanceOrder } from '../../../common/exchanges/binance/model/binance-order';
import { round } from '../../../../configuration/util/math';
import { extractAssets } from '../../../../configuration/util/symbol';

export class BinanceOrderClient implements ExchangeOrderClient {
  constructor(private url: string, private binanceAuthentication: BinanceAuthentication) {}

  getExchange(): TickerExchange {
    return 'Binance';
  }

  async sendOrder(transientOrder: TransientOrder): Promise<Order> {
    const queryParameters = this.#getQueryParameters(transientOrder);
    const querySignature = await this.binanceAuthentication.getSignature(queryParameters);
    const queryUrl = `/v3/order?${queryParameters}&signature=${querySignature}`;
    const queryConfig = this.#getQueryConfig(await this.binanceAuthentication.getApiKey());
    const response = await axiosInstance.post<BinanceOrder>(queryUrl, null, queryConfig);

    const executedQuantityAndPrice = this.#calculateExecutedQuantityAndPrice(response.data);

    // when commission is paid with the base asset, commission quantity should be deducted from executed quantity
    if (executedQuantityAndPrice && response.data.fills.length > 0) {
      const basetAsset = extractAssets(transientOrder.symbol).baseAsset;
      const fills = response.data.fills.filter((fill) => fill.commissionAsset === basetAsset);
      executedQuantityAndPrice.quantity -= fills.reduce((total, current) => total + +current.commission, 0);
    }

    return {
      ...transientOrder,
      status: fromBinanceOrderStatus(response.data.status),
      externalId: response.data.orderId.toString(),
      externalStatus: response.data.status,
      transactionDate: new Date(response.data.transactTime),
      executedQuantity: executedQuantityAndPrice?.quantity ? round(executedQuantityAndPrice.quantity, 15) : undefined,
      executedPrice: executedQuantityAndPrice?.price ? round(executedQuantityAndPrice.price, 15) : undefined,
    };
  }

  #getQueryParameters(transientOrder: TransientOrder): string {
    const symbol = toBinanceSymbol(transientOrder.symbol);
    const side = toBinanceOrderSide(transientOrder.side);
    const quantity = `${transientOrder.quote ? 'quoteOrderQty' : 'quantity'}=${transientOrder.requestedQuantity}`;
    const price = transientOrder.requestedPrice;

    switch (transientOrder.type) {
      case 'Market':
        return `symbol=${symbol}&side=${side}&type=MARKET&${quantity}&newOrderRespType=FULL&timestamp=${new Date().valueOf()}`;
      case 'Limit':
        return `symbol=${symbol}&side=${side}&type=LIMIT&${quantity}&price=${price}&timeInForce=GTC&newOrderRespType=FULL&timestamp=${new Date().valueOf()}`;
      default:
        throw new Error(`Unsupported '${transientOrder.type}' Binance order type`);
    }
  }

  #getQueryConfig(apiKey: string): AxiosRequestConfig {
    return {
      baseURL: this.url,
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    };
  }

  #calculateExecutedQuantityAndPrice(binanceOrder: BinanceOrder): { quantity: number; price: number } | undefined {
    const totalQuantity = +binanceOrder.executedQty;
    if (totalQuantity === 0) {
      return undefined;
    }

    return {
      quantity: totalQuantity,
      price: +binanceOrder.price > 0 ? +binanceOrder.price : +binanceOrder.cummulativeQuoteQty / totalQuantity,
    };
  }
}
