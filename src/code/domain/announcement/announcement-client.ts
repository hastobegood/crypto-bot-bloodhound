import { Announcement, AnnouncementExchange } from './model/announcement';

export interface AnnouncementClient {
  getAllByExchange(exchange: AnnouncementExchange): Promise<Announcement[]>;
}
