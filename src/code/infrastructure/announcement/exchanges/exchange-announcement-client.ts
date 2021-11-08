import { Announcement, AnnouncementExchange } from '../../../domain/announcement/model/announcement';

export interface ExchangeAnnouncementClient {
  getExchange(): AnnouncementExchange;

  getAllAnnouncements(): Promise<Announcement[]>;
}
