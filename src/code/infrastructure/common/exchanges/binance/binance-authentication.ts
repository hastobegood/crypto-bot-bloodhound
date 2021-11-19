import { GetSecretValueCommand, GetSecretValueCommandInput, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { BinanceSecrets } from './model/binance-secret';
import crypto from 'crypto';

export class BinanceAuthentication {
  private secrets?: BinanceSecrets;

  constructor(private secretName: string, private smClient: SecretsManagerClient) {}

  async getSignature(parameters: string): Promise<string> {
    const hmac = crypto.createHmac('sha256', (await this.#getSecrets()).secretKey);
    const result = hmac.update(parameters);

    return result.digest('hex');
  }

  async getApiKey(): Promise<string> {
    return (await this.#getSecrets()).apiKey;
  }

  async #getSecrets(): Promise<BinanceSecrets> {
    if (!this.secrets) {
      const getSecretValueInput: GetSecretValueCommandInput = {
        SecretId: this.secretName,
      };

      const getSecretValueOutput = await this.smClient.send(new GetSecretValueCommand(getSecretValueInput));

      this.secrets = JSON.parse(getSecretValueOutput.SecretString!) as BinanceSecrets;
    }
    return this.secrets;
  }
}
