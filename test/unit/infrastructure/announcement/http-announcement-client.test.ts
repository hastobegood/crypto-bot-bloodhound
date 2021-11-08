import { mocked } from 'ts-jest/utils';
import { HttpAnnouncementClient } from '../../../../src/code/infrastructure/announcement/http-announcement-client';
import { BinanceAnnouncementClient } from '../../../../src/code/infrastructure/announcement/exchanges/binance/binance-announcement-client';
import { Announcement, AnnouncementExchange } from '../../../../src/code/domain/announcement/model/announcement';
import { buildDefaultAnnouncements } from '../../../builders/domain/announcement/announcement-builder';

const binanceAnnouncementClientMock = mocked(jest.genMockFromModule<BinanceAnnouncementClient>('../../../../src/code/infrastructure/announcement/exchanges/binance/binance-announcement-client'), true);

let announcementClient: HttpAnnouncementClient;
beforeEach(() => {
  binanceAnnouncementClientMock.getExchange = jest.fn();
  binanceAnnouncementClientMock.getAllAnnouncements = jest.fn();

  announcementClient = new HttpAnnouncementClient([binanceAnnouncementClientMock]);
});

describe('HttpAnnouncementClient', () => {
  beforeEach(() => {
    binanceAnnouncementClientMock.getExchange.mockReturnValue('Binance');
  });

  describe('Given all announcements to retrieve for an exchange', () => {
    describe('When exchange is unknown', () => {
      it('Then error is thrown', async () => {
        try {
          await announcementClient.getAllByExchange('Unknown' as AnnouncementExchange);
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual("Unsupported 'Unknown' exchange");
        }

        expect(binanceAnnouncementClientMock.getExchange).toHaveBeenCalledTimes(1);
        const getExchangeParams = binanceAnnouncementClientMock.getExchange.mock.calls[0];
        expect(getExchangeParams.length).toEqual(0);

        expect(binanceAnnouncementClientMock.getAllAnnouncements).toHaveBeenCalledTimes(0);
      });
    });

    describe('When exchange is known', () => {
      let announcements: Announcement[];

      beforeEach(() => {
        announcements = buildDefaultAnnouncements();

        binanceAnnouncementClientMock.getAllAnnouncements.mockResolvedValueOnce(announcements);
      });

      it('Then announcements list is returned', async () => {
        const result = await announcementClient.getAllByExchange('Binance');
        expect(result).toEqual(announcements);

        expect(binanceAnnouncementClientMock.getExchange).toHaveBeenCalledTimes(1);
        const getExchangeParams = binanceAnnouncementClientMock.getExchange.mock.calls[0];
        expect(getExchangeParams.length).toEqual(0);

        expect(binanceAnnouncementClientMock.getAllAnnouncements).toHaveBeenCalledTimes(1);
        const getAllAnnouncementsParams = binanceAnnouncementClientMock.getAllAnnouncements.mock.calls[0];
        expect(getAllAnnouncementsParams.length).toEqual(0);
      });
    });
  });
});
