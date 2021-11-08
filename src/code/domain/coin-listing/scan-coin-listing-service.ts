import { CoinListingRepository } from './coin-listing-repository';
import { CoinListing, CoinListingExchange } from './model/coin-listing';
import { CoinListingPublisher } from './coin-listing-publisher';
import { GetAnnouncementService } from '../announcement/get-announcement-service';
import { Announcement } from '../announcement/model/announcement';

export class ScanCoinListingService {
  constructor(private getAnnouncementService: GetAnnouncementService, private coinListingRepository: CoinListingRepository, private coinListingPublisher: CoinListingPublisher) {}

  async scan(exchange: CoinListingExchange): Promise<void> {
    const announcements = await this.getAnnouncementService.getAllByExchange(exchange);
    const coinListings = (await Promise.all(announcements.map((announcement) => this.#buildCoinListing(exchange, announcement)))).filter((coinListing): coinListing is CoinListing => !!coinListing);

    if (coinListings.length) {
      await Promise.all([this.coinListingRepository.saveAll(coinListings), this.coinListingPublisher.publishAll(coinListings)]);
    }
  }

  async #buildCoinListing(exchange: CoinListingExchange, announcement: Announcement): Promise<CoinListing | null> {
    const id = `${exchange}/${announcement.coin}/${announcement.date.valueOf()}`;
    if (await this.#exists(id)) {
      return null;
    }

    const creationDate = new Date();
    const waitingDate = announcement.date.valueOf() - 60 * 2 * 1_000;
    if (creationDate.valueOf() > waitingDate) {
      return null;
    }

    return {
      id: id,
      coin: announcement.coin,
      exchange: exchange,
      creationDate: creationDate,
      listingDate: announcement.date,
      waitingDate: new Date(waitingDate),
    };
  }

  async #exists(id: string): Promise<boolean> {
    return this.coinListingRepository.getById(id).then((coinListing) => !!coinListing);
  }
}
