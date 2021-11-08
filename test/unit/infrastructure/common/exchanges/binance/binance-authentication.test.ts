import { mocked } from 'ts-jest/utils';
import { BinanceAuthentication } from '../../../../../../src/code/infrastructure/common/exchanges/binance/binance-authentication';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import crypto from 'crypto';

const smClientMock = mocked(jest.genMockFromModule<SecretsManagerClient>('@aws-sdk/client-secrets-manager'), true);

let binanceAuthentication: BinanceAuthentication;
beforeEach(() => {
  smClientMock.send = jest.fn();

  binanceAuthentication = new BinanceAuthentication('my-secrets', smClientMock);
});

describe('BinanceAuthentication', () => {
  describe('Give a signature to generate', () => {
    describe('When multiple requests', () => {
      let signature: string;

      beforeEach(() => {
        const hmac = crypto.createHmac('sha256', 'my-secret-key');
        const result = hmac.update('my-parameters');
        signature = result.digest('hex');

        smClientMock.send.mockImplementation(() => ({
          SecretString: '{"apiKey": "my-api-key", "secretKey": "my-secret-key"}',
        }));
      });

      it('Then same signature is always returned', async () => {
        let result = await binanceAuthentication.getSignature('my-parameters');
        expect(result).toEqual(signature);
        result = await binanceAuthentication.getSignature('my-parameters');
        expect(result).toEqual(signature);
        result = await binanceAuthentication.getSignature('my-parameters');
        expect(result).toEqual(signature);

        expect(smClientMock.send).toHaveBeenCalledTimes(1);
        const sendParams = smClientMock.send.mock.calls[0];
        expect(sendParams.length).toEqual(1);
        expect(sendParams[0].input).toEqual({
          SecretId: 'my-secrets',
        });
      });
    });
  });
});
