export interface DailyOHLCV {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface TimeSeriesDaily {
  [date: string]: DailyOHLCV;
}

export interface TimeSeriesDailyResponse {
  'Meta Data': TimeSeriesDailyMetaData;
  'Time Series (Daily)': TimeSeriesDaily;
}

export interface TimeSeriesDailyMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Output Size': 'Compact' | 'Full' | string;
  '5. Time Zone': string;
}
