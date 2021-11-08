import { axiosInstance } from '../../../../configuration/http/axios';
import { ExchangeAnnouncementClient } from '../exchange-announcement-client';
import { HTMLElement, parse } from 'node-html-parser';
import { Announcement, AnnouncementExchange } from '../../../../domain/announcement/model/announcement';

const linkIds = ['link-0-0-p1', 'link-0-1-p1', 'link-0-2-p1', 'link-0-3-p1', 'link-0-4-p1', 'link-0-5-p1', 'link-0-6-p1', 'link-0-7-p1', 'link-0-8-p1', 'link-0-9-p1', 'link-0-10-p1', 'link-0-11-p1', 'link-0-12-p1', 'link-0-13-p1', 'link-0-14-p1'];
const linkRegex = new RegExp('Binance Will List .+ \\((.+)\\).*');
const announcementRegex = new RegExp('Binance will list .+ at ([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}) \\(UTC\\)');

export class BinanceAnnouncementClient implements ExchangeAnnouncementClient {
  constructor(private url: string) {}

  getExchange(): AnnouncementExchange {
    return 'Binance';
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    const links = await this.#extractLinks();

    return this.#extractAnnouncements(links);
  }

  async #extractLinks(): Promise<Link[]> {
    const response = await axiosInstance.get<string>(`${this.url}/en/support/announcement/c-48`);
    const rootElement = parse(response.data);

    const links = linkIds.map((linkId) => this.#extractLink(linkId, rootElement));

    return links.filter((link): link is Link => !!link);
  }

  #extractLink(linkId: string, rootElement: HTMLElement): Link | null {
    const element = rootElement.querySelector(`#${linkId}`);
    const href = element?.getAttribute('href');
    if (element && href) {
      const matches = element.text.match(linkRegex);
      if (matches && matches.length === 2) {
        return {
          coin: matches[1],
          url: `${this.url}${href}`,
        };
      }
    }

    return null;
  }

  async #extractAnnouncements(links: Link[]): Promise<Announcement[]> {
    const announcements = await Promise.all(links.map(this.#extractAnnouncement));

    return announcements.filter((announcement): announcement is Announcement => !!announcement);
  }

  async #extractAnnouncement(link: Link): Promise<Announcement | null> {
    const response = await axiosInstance.get<string>(link.url);
    const rootElement = parse(response.data);

    const elements = rootElement.querySelectorAll('.css-3fpgoh');
    const matches = elements.map((element) => element.text.match(announcementRegex));
    const date = matches.find((match) => match && match.length === 6);
    if (!date) {
      return null;
    }

    return {
      ...link,
      exchange: 'Binance',
      date: new Date(Date.UTC(+date[1], +date[2] - 1, +date[3], +date[4], +date[5])),
    };
  }
}

interface Link {
  coin: string;
  url: string;
}
