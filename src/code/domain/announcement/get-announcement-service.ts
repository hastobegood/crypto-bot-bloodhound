import { AnnouncementClient } from './announcement-client';
import { Announcement, AnnouncementExchange } from './model/announcement';

export class GetAnnouncementService {
  constructor(private announcementClient: AnnouncementClient) {}

  async getAllByExchange(exchange: AnnouncementExchange): Promise<Announcement[]> {
    return this.announcementClient.getAllByExchange(exchange);
  }
}
