export type AnnouncementExchange = 'Binance';

export interface Announcement {
  exchange: AnnouncementExchange;
  coin: string;
  date: Date;
  url: string;
}
