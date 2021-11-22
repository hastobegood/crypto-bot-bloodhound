import { mocked } from 'ts-jest/utils';
import MockDate from 'mockdate';
import { ScanCoinListingService } from '../../../../src/code/domain/coin-listing/scan-coin-listing-service';
import { CoinListingRepository } from '../../../../src/code/domain/coin-listing/coin-listing-repository';
import { expect } from '@jest/globals';
import { CoinListing } from '../../../../src/code/domain/coin-listing/model/coin-listing';
import { buildDefaultCoinListing } from '../../../builders/domain/coin-listing/coin-listing-builder';
import { CoinListingPublisher } from '../../../../src/code/domain/coin-listing/coin-listing-publisher';
import { GetAnnouncementService } from '../../../../src/code/domain/announcement/get-announcement-service';
import { Announcement } from '../../../../src/code/domain/announcement/model/announcement';
import { buildDefaultAnnouncement } from '../../../builders/domain/announcement/announcement-builder';

const getAnnouncementServiceMock = mocked(jest.genMockFromModule<GetAnnouncementService>('../../../../src/code/domain/announcement/get-announcement-service'), true);
const coinListingRepositoryMock = mocked(jest.genMockFromModule<CoinListingRepository>('../../../../src/code/domain/coin-listing/coin-listing-repository'), true);
const coinListingPublisherMock = mocked(jest.genMockFromModule<CoinListingPublisher>('../../../../src/code/domain/coin-listing/coin-listing-publisher'), true);

let scanCoinListingService: ScanCoinListingService;
beforeEach(() => {
  getAnnouncementServiceMock.getAllByExchange = jest.fn();
  coinListingRepositoryMock.getById = jest.fn();
  coinListingRepositoryMock.saveAll = jest.fn();
  coinListingPublisherMock.publishAll = jest.fn();

  scanCoinListingService = new ScanCoinListingService(getAnnouncementServiceMock, coinListingRepositoryMock, coinListingPublisherMock);
});

describe('ScanCoinListingService', () => {
  let date: Date;

  beforeEach(() => {
    date = new Date('2021-09-17T00:00:11.666Z');
    MockDate.set(date);
  });

  describe('Given an exchange to scan for coin listing', () => {
    describe('When no announcement at all', () => {
      beforeEach(() => {
        getAnnouncementServiceMock.getAllByExchange.mockResolvedValueOnce([]);
      });

      it('Then coin listings are not saved', async () => {
        await scanCoinListingService.scan('Binance');

        expect(getAnnouncementServiceMock.getAllByExchange).toHaveBeenCalledTimes(1);
        const getAllAnnouncementsByExchangeParams = getAnnouncementServiceMock.getAllByExchange.mock.calls[0];
        expect(getAllAnnouncementsByExchangeParams.length).toEqual(1);
        expect(getAllAnnouncementsByExchangeParams[0]).toEqual('Binance');

        expect(coinListingRepositoryMock.getById).toHaveBeenCalledTimes(0);
        expect(coinListingRepositoryMock.saveAll).toHaveBeenCalledTimes(0);
        expect(coinListingPublisherMock.publishAll).toHaveBeenCalledTimes(0);
      });
    });

    describe('When no new announcement', () => {
      let announcement: Announcement;
      let coinListing: CoinListing;

      beforeEach(() => {
        announcement = buildDefaultAnnouncement();
        coinListing = buildDefaultCoinListing();

        getAnnouncementServiceMock.getAllByExchange.mockResolvedValueOnce([announcement]);
        coinListingRepositoryMock.getById.mockResolvedValueOnce(coinListing);
      });

      it('Then coin listings are not saved', async () => {
        await scanCoinListingService.scan('Binance');

        expect(getAnnouncementServiceMock.getAllByExchange).toHaveBeenCalledTimes(1);
        const getAllAnnouncementsByExchangeParams = getAnnouncementServiceMock.getAllByExchange.mock.calls[0];
        expect(getAllAnnouncementsByExchangeParams.length).toEqual(1);
        expect(getAllAnnouncementsByExchangeParams[0]).toEqual('Binance');

        expect(coinListingRepositoryMock.getById).toHaveBeenCalledTimes(1);
        const getByIdParams = coinListingRepositoryMock.getById.mock.calls[0];
        expect(getByIdParams.length).toEqual(1);
        expect(getByIdParams[0]).toEqual(`Binance/${announcement.coin}/${announcement.date.valueOf()}`);

        expect(coinListingRepositoryMock.saveAll).toHaveBeenCalledTimes(0);
        expect(coinListingPublisherMock.publishAll).toHaveBeenCalledTimes(0);
      });
    });

    describe('When new announcements', () => {
      let announcement1: Announcement;
      let announcement2: Announcement;
      let coinListing1: CoinListing;

      beforeEach(() => {
        announcement1 = buildDefaultAnnouncement();
        announcement2 = { ...buildDefaultAnnouncement(), date: new Date(date.valueOf() + 5 * 1_000) };
        coinListing1 = buildDefaultCoinListing();

        getAnnouncementServiceMock.getAllByExchange.mockResolvedValueOnce([announcement1, announcement2]);
        coinListingRepositoryMock.getById.mockResolvedValueOnce(coinListing1).mockResolvedValueOnce(null);
      });

      it('Then coin listings are saved', async () => {
        await scanCoinListingService.scan('Binance');

        expect(getAnnouncementServiceMock.getAllByExchange).toHaveBeenCalledTimes(1);
        const getAllAnnouncementsByExchangeParams = getAnnouncementServiceMock.getAllByExchange.mock.calls[0];
        expect(getAllAnnouncementsByExchangeParams.length).toEqual(1);
        expect(getAllAnnouncementsByExchangeParams[0]).toEqual('Binance');

        expect(coinListingRepositoryMock.getById).toHaveBeenCalledTimes(2);
        let getByIdParams = coinListingRepositoryMock.getById.mock.calls[0];
        expect(getByIdParams.length).toEqual(1);
        expect(getByIdParams[0]).toEqual(`Binance/${announcement1.coin}/${announcement1.date.valueOf()}`);
        getByIdParams = coinListingRepositoryMock.getById.mock.calls[1];
        expect(getByIdParams.length).toEqual(1);
        expect(getByIdParams[0]).toEqual(`Binance/${announcement2.coin}/${announcement2.date.valueOf()}`);

        expect(coinListingRepositoryMock.saveAll).toHaveBeenCalledTimes(1);
        const saveAllParams = coinListingRepositoryMock.saveAll.mock.calls[0];
        expect(saveAllParams.length).toEqual(1);
        expect(saveAllParams[0]).toEqual([
          {
            id: `Binance/${announcement2.coin}/${announcement2.date.valueOf()}`,
            coin: announcement2.coin,
            exchange: 'Binance',
            creationDate: date,
            listingDate: announcement2.date,
            waitingDate: new Date(announcement2.date.valueOf() - 5 * 1_000),
          },
        ]);

        expect(coinListingPublisherMock.publishAll).toHaveBeenCalledTimes(1);
        const publishAllParams = coinListingPublisherMock.publishAll.mock.calls[0];
        expect(publishAllParams.length).toEqual(1);
        expect(publishAllParams[0]).toEqual([
          {
            id: `Binance/${announcement2.coin}/${announcement2.date.valueOf()}`,
            coin: announcement2.coin,
            exchange: 'Binance',
            creationDate: date,
            listingDate: announcement2.date,
            waitingDate: new Date(announcement2.date.valueOf() - 5 * 1_000),
          },
        ]);
      });
    });

    describe('When old announcements', () => {
      let announcement1: Announcement;
      let announcement2: Announcement;
      let coinListing1: CoinListing;

      beforeEach(() => {
        announcement1 = buildDefaultAnnouncement();
        announcement2 = { ...buildDefaultAnnouncement(), date: new Date(date.valueOf() + 5 * 1_000 - 1) };
        coinListing1 = buildDefaultCoinListing();

        getAnnouncementServiceMock.getAllByExchange.mockResolvedValueOnce([announcement1, announcement2]);
        coinListingRepositoryMock.getById.mockResolvedValueOnce(coinListing1).mockResolvedValueOnce(null);
      });

      it('Then coin listings are not saved', async () => {
        await scanCoinListingService.scan('Binance');

        expect(getAnnouncementServiceMock.getAllByExchange).toHaveBeenCalledTimes(1);
        const getAllAnnouncementsByExchangeParams = getAnnouncementServiceMock.getAllByExchange.mock.calls[0];
        expect(getAllAnnouncementsByExchangeParams.length).toEqual(1);
        expect(getAllAnnouncementsByExchangeParams[0]).toEqual('Binance');

        expect(coinListingRepositoryMock.getById).toHaveBeenCalledTimes(2);
        let getByIdParams = coinListingRepositoryMock.getById.mock.calls[0];
        expect(getByIdParams.length).toEqual(1);
        expect(getByIdParams[0]).toEqual(`Binance/${announcement1.coin}/${announcement1.date.valueOf()}`);
        getByIdParams = coinListingRepositoryMock.getById.mock.calls[1];
        expect(getByIdParams.length).toEqual(1);
        expect(getByIdParams[0]).toEqual(`Binance/${announcement2.coin}/${announcement2.date.valueOf()}`);

        expect(coinListingRepositoryMock.saveAll).toHaveBeenCalledTimes(0);
        expect(coinListingPublisherMock.publishAll).toHaveBeenCalledTimes(0);
      });
    });
  });
});
