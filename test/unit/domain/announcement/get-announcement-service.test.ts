import { AnnouncementClient } from '../../../../src/code/domain/announcement/announcement-client';
import { GetAnnouncementService } from '../../../../src/code/domain/announcement/get-announcement-service';
import { Announcement } from '../../../../src/code/domain/announcement/model/announcement';
import { buildDefaultAnnouncements } from '../../../builders/domain/announcement/announcement-builder';

const announcementClientMock = jest.mocked(jest.genMockFromModule<AnnouncementClient>('../../../../src/code/domain/announcement/announcement-client'), true);

let getAnnouncementService: GetAnnouncementService;
beforeEach(() => {
  announcementClientMock.getAllByExchange = jest.fn();

  getAnnouncementService = new GetAnnouncementService(announcementClientMock);
});

describe('GetAnnouncementService', () => {
  describe('Given all announcements to retrieve for an exchange', () => {
    describe('When announcements are found', () => {
      let announcements: Announcement[];

      beforeEach(() => {
        announcements = buildDefaultAnnouncements();
        announcementClientMock.getAllByExchange.mockResolvedValue(announcements);
      });

      it('Then announcements are returned', async () => {
        const result = await getAnnouncementService.getAllByExchange('Binance');
        expect(result).toEqual(announcements);

        expect(announcementClientMock.getAllByExchange).toHaveBeenCalledTimes(1);
        const getAllByExchangeParams = announcementClientMock.getAllByExchange.mock.calls[0];
        expect(getAllByExchangeParams?.length).toEqual(1);
        expect(getAllByExchangeParams?.[0]).toEqual('Binance');
      });
    });
  });
});
