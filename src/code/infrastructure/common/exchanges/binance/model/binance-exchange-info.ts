export interface BinanceExchangeInfo {
  symbols: BinanceExchangeInfoSymbol[];
}

export interface BinanceExchangeInfoSymbol {
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  filters: BinanceExchangeInfoFilter[];
}

export interface BinanceExchangeInfoFilter {
  filterType: string;
  tickSize?: string;
  stepSize?: string;
}
