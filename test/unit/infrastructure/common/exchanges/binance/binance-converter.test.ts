import { fromBinanceOrderStatus, toBinanceOrderSide, toBinanceOrderType, toBinanceSymbol } from '../../../../../../src/code/infrastructure/common/exchanges/binance/binance-converter';
import { OrderStatus as BinanceOrderStatus } from '@hastobegood/crypto-clients-binance/order';
import { OrderSide, OrderType } from '../../../../../../src/code/domain/order/model/order';

describe('BinanceConverter', () => {
  describe('Given a symbol', () => {
    describe('When invalid value', () => {
      it('Then error is thrown', async () => {
        try {
          toBinanceSymbol('ABCDEF');
          fail();
        } catch (error) {
          expect(error).toBeDefined();
          expect((error as Error).message).toEqual("Unable to extract assets, symbol 'ABCDEF' is invalid");
        }

        try {
          toBinanceSymbol('AB#CD#EF');
          fail();
        } catch (error) {
          expect(error).toBeDefined();
          expect((error as Error).message).toEqual("Unable to extract assets, symbol 'AB#CD#EF' is invalid");
        }
      });
    });

    describe('When valid value', () => {
      it('Then converted value is returned', async () => {
        const result = toBinanceSymbol('ABC#DEF');
        expect(result).toEqual('ABCDEF');
      });
    });
  });

  describe('Given an order side', () => {
    describe('When known value', () => {
      it('Then converted value is returned', async () => {
        expect(toBinanceOrderSide('Buy')).toEqual('BUY');
        expect(toBinanceOrderSide('Sell')).toEqual('SELL');
      });
    });

    describe('When unknown value', () => {
      it('Then error is thrown', async () => {
        try {
          toBinanceOrderSide('XXX' as OrderSide);
          fail();
        } catch (error) {
          expect(error).toBeDefined();
          expect((error as Error).message).toEqual("Unsupported 'XXX' Binance order side");
        }
      });
    });
  });

  describe('Given an order type', () => {
    describe('When known value', () => {
      it('Then converted value is returned', async () => {
        expect(toBinanceOrderType('Market')).toEqual('MARKET');
        expect(toBinanceOrderType('Limit')).toEqual('LIMIT');
      });
    });

    describe('When unknown value', () => {
      it('Then error is thrown', async () => {
        try {
          toBinanceOrderType('XXX' as OrderType);
          fail();
        } catch (error) {
          expect(error).toBeDefined();
          expect((error as Error).message).toEqual("Unsupported 'XXX' Binance order type");
        }
      });
    });
  });

  describe('Given a Binance order status', () => {
    describe('When known value', () => {
      it('Then converted value is returned', async () => {
        expect(fromBinanceOrderStatus('NEW')).toEqual('Waiting');
        expect(fromBinanceOrderStatus('PARTIALLY_FILLED')).toEqual('PartiallyFilled');
        expect(fromBinanceOrderStatus('FILLED')).toEqual('Filled');
        expect(fromBinanceOrderStatus('PENDING_CANCEL')).toEqual('Canceled');
        expect(fromBinanceOrderStatus('CANCELED')).toEqual('Canceled');
        expect(fromBinanceOrderStatus('EXPIRED')).toEqual('Error');
        expect(fromBinanceOrderStatus('REJECTED')).toEqual('Error');
      });
    });

    describe('When unknown value', () => {
      it('Then unknown value is returned', async () => {
        expect(fromBinanceOrderStatus('XXX' as BinanceOrderStatus)).toEqual('Unknown');
      });
    });
  });
});
