declare namespace NodeJS {
  export interface ProcessEnv {
    ENV: string;
    REGION: string;
    TRACING: boolean;
    EXCHANGES_SECRET_NAME: string;
    PHONE_NUMBERS: string;
    QUOTE_ASSET: string;
    QUOTE_ASSET_QUANTITY: number;
    RETRY_INTERVAL_MILLISECONDS: number;
    COIN_LISTING_TABLE_NAME: string;
  }
}
