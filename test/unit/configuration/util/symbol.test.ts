import { extractAssets } from '../../../../src/code/configuration/util/symbol';

describe('Symbol', () => {
  describe('Given assets to extract from a symbol', () => {
    describe('When symbol is invalid', () => {
      it('Then error is thrown', async () => {
        try {
          extractAssets('ABCDEF');
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual("Unable to extract assets, symbol 'ABCDEF' is invalid");
        }

        try {
          extractAssets('AB#CD#EF');
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual("Unable to extract assets, symbol 'AB#CD#EF' is invalid");
        }
      });
    });

    describe('When symbol is valid', () => {
      it('Then base and quote assets are returned', async () => {
        const result = extractAssets('ABC#DEF');
        expect(result).toEqual({
          baseAsset: 'ABC',
          quoteAsset: 'DEF',
        });
      });
    });
  });
});
