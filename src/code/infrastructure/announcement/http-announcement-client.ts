import { ExchangeAnnouncementClient } from './exchanges/exchange-announcement-client';
import { AnnouncementClient } from '../../domain/announcement/announcement-client';
import { Announcement, AnnouncementExchange } from '../../domain/announcement/model/announcement';

export class HttpAnnouncementClient implements AnnouncementClient {
  constructor(private exchangeAnnouncementClients: ExchangeAnnouncementClient[]) {}

  async getAllByExchange(exchange: AnnouncementExchange): Promise<Announcement[]> {
    return this.#getExchangeAnnouncementClient(exchange).getAllAnnouncements();
  }

  #getExchangeAnnouncementClient(exchange: AnnouncementExchange): ExchangeAnnouncementClient {
    const exchangeAnnouncementClient = this.exchangeAnnouncementClients.find((exchangeAnnouncementClient) => exchangeAnnouncementClient.getExchange() === exchange);
    if (!exchangeAnnouncementClient) {
      throw new Error(`Unsupported '${exchange}' exchange`);
    }
    return exchangeAnnouncementClient;
  }
}
