import { fromBinanceOrderStatus, toBinanceOrderSide, toBinanceOrderType, toBinanceSymbol } from '../../../common/exchanges/binance/binance-converter';
import { round } from '../../../../configuration/util/math';
import { extractAssets } from '../../../../configuration/util/symbol';
import { ExchangeOrderClient } from '../exchange-order-client';
import { Order, OrderExchange, TransientOrder } from '../../../../domain/order/model/order';
import { Client, SendOrderCommand, SendOrderInput, SendOrderOutput } from '@hastobegood/crypto-clients-binance';

export class BinanceOrderClient implements ExchangeOrderClient {
  constructor(private client: Client) {}

  getExchange(): OrderExchange {
    return 'Binance';
  }

  async sendOrder(transientOrder: TransientOrder): Promise<Order> {
    const input = this.#buildSendOrderCommandInput(transientOrder);
    const output = await this.client.send(new SendOrderCommand(input));

    const executedQuantityAndPrice = this.#calculateExecutedQuantityAndPrice(output.data);

    // when commission is paid with the base asset, commission quantity should be deducted from executed quantity
    if (executedQuantityAndPrice && output.data.fills.length > 0) {
      const basetAsset = extractAssets(transientOrder.symbol).baseAsset;
      const fills = output.data.fills.filter((fill) => fill.commissionAsset === basetAsset);
      executedQuantityAndPrice.quantity -= fills.reduce((total, current) => total + +current.commission, 0);
    }

    return {
      ...transientOrder,
      status: fromBinanceOrderStatus(output.data.status),
      externalId: output.data.orderId.toString(),
      externalStatus: output.data.status,
      transactionDate: new Date(output.data.transactTime),
      executedQuantity: executedQuantityAndPrice?.quantity ? round(executedQuantityAndPrice.quantity, 15) : undefined,
      executedPrice: executedQuantityAndPrice?.price ? round(executedQuantityAndPrice.price, 15) : undefined,
    };
  }

  #buildSendOrderCommandInput(transientOrder: TransientOrder): SendOrderInput {
    return {
      symbol: toBinanceSymbol(transientOrder.symbol),
      side: toBinanceOrderSide(transientOrder.side),
      type: toBinanceOrderType(transientOrder.type),
      quoteOrderQty: transientOrder.quote ? transientOrder.requestedQuantity : undefined,
      quantity: !transientOrder.quote ? transientOrder.requestedQuantity : undefined,
      price: transientOrder.requestedPrice,
    };
  }

  #calculateExecutedQuantityAndPrice(sendOrderOutput: SendOrderOutput): { quantity: number; price: number } | undefined {
    const totalQuantity = +sendOrderOutput.executedQty;
    if (totalQuantity === 0) {
      return undefined;
    }

    return {
      quantity: totalQuantity,
      price: +sendOrderOutput.price > 0 ? +sendOrderOutput.price : +sendOrderOutput.cummulativeQuoteQty / totalQuantity,
    };
  }
}
