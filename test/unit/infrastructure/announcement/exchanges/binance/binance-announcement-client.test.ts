import { axiosInstance } from '../../../../../../src/code/configuration/http/axios';
import { BinanceAnnouncementClient } from '../../../../../../src/code/infrastructure/announcement/exchanges/binance/binance-announcement-client';

jest.mock('../../../../../../src/code/configuration/http/axios');

const axiosInstanceMock = jest.mocked(axiosInstance, true);

let binanceCoinListingClient: BinanceAnnouncementClient;
beforeEach(() => {
  binanceCoinListingClient = new BinanceAnnouncementClient();
});

describe('BinanceAnnouncementClient', () => {
  describe('Given the exchange to retrieve', () => {
    it('Then Binance exchange is returned', async () => {
      expect(binanceCoinListingClient.getExchange()).toEqual('Binance');
    });
  });

  describe('Given all announcements to retrieve', () => {
    const htmlStart = '<html lang="en"><body><div id="main">';
    const htmlEnd = '</div></body></html>';

    describe('Where no announcement', () => {
      beforeEach(() => {
        //link1 = '<div id="link-0-0-p1">Binance Will List coin1 (COIN1)</div>';
        axiosInstanceMock.get.mockResolvedValueOnce({
          data: `${htmlStart}hello${htmlEnd}`,
        });
      });

      it('Then empty list is returned', async () => {
        const result = await binanceCoinListingClient.getAllAnnouncements();
        expect(result).toEqual([]);

        expect(axiosInstanceMock.get).toHaveBeenCalledTimes(1);
        const getParams = axiosInstanceMock.get.mock.calls[0];
        expect(getParams?.length).toEqual(1);
        expect(getParams?.[0]).toEqual('https://www.binance.com/en/support/announcement/c-48');
      });
    });

    describe('Where multiple announcements', () => {
      describe('And missing link element', () => {
        beforeEach(() => {
          axiosInstanceMock.get.mockResolvedValueOnce({
            data: `${htmlStart}<div id="link-0-0-p1">Binance Will List coin1 (COIN1)</div>${htmlEnd}`,
          });
        });

        it('Then empty list is returned', async () => {
          const result = await binanceCoinListingClient.getAllAnnouncements();
          expect(result).toEqual([]);

          expect(axiosInstanceMock.get).toHaveBeenCalledTimes(1);
          const getParams = axiosInstanceMock.get.mock.calls[0];
          expect(getParams?.length).toEqual(1);
          expect(getParams?.[0]).toEqual('https://www.binance.com/en/support/announcement/c-48');
        });
      });

      describe('And missing href attribute', () => {
        beforeEach(() => {
          axiosInstanceMock.get.mockResolvedValueOnce({
            data: `${htmlStart}<a id="link-0-0-p1">Binance Will List coin1 (COIN1)</a>${htmlEnd}`,
          });
        });

        it('Then empty list is returned', async () => {
          const result = await binanceCoinListingClient.getAllAnnouncements();
          expect(result).toEqual([]);

          expect(axiosInstanceMock.get).toHaveBeenCalledTimes(1);
          const getParams = axiosInstanceMock.get.mock.calls[0];
          expect(getParams?.length).toEqual(1);
          expect(getParams?.[0]).toEqual('https://www.binance.com/en/support/announcement/c-48');
        });
      });

      describe('And text does not match coin listing', () => {
        beforeEach(() => {
          axiosInstanceMock.get.mockResolvedValueOnce({
            data: `${htmlStart}<a id="link-0-0-p1" href="/free-money">Binance Will Give Free Money</a>${htmlEnd}`,
          });
        });

        it('Then empty list is returned', async () => {
          const result = await binanceCoinListingClient.getAllAnnouncements();
          expect(result).toEqual([]);

          expect(axiosInstanceMock.get).toHaveBeenCalledTimes(1);
          const getParams = axiosInstanceMock.get.mock.calls[0];
          expect(getParams?.length).toEqual(1);
          expect(getParams?.[0]).toEqual('https://www.binance.com/en/support/announcement/c-48');
        });
      });

      describe('And coin listing details page does not match', () => {
        beforeEach(() => {
          axiosInstanceMock.get
            .mockResolvedValueOnce({
              data: `${htmlStart}<a id="link-0-0-p1" href="/details-coin1">Binance Will List coin1 (COIN1)</a>${htmlEnd}`,
            })
            .mockResolvedValueOnce({
              data: `${htmlStart}<div class="css-3fpgoh">Binance will list COIN1 at 2021-08-22 16:25 (UTC+2)</div>${htmlEnd}`,
            });
        });

        it('Then empty list is returned', async () => {
          const result = await binanceCoinListingClient.getAllAnnouncements();
          expect(result).toEqual([]);

          expect(axiosInstanceMock.get).toHaveBeenCalledTimes(2);
          let getParams = axiosInstanceMock.get.mock.calls[0];
          expect(getParams?.length).toEqual(1);
          expect(getParams?.[0]).toEqual('https://www.binance.com/en/support/announcement/c-48');
          getParams = axiosInstanceMock.get.mock.calls[1];
          expect(getParams?.length).toEqual(1);
          expect(getParams?.[0]).toEqual('https://www.binance.com/details-coin1');
        });
      });

      describe('And coin listing details page does match', () => {
        beforeEach(() => {
          axiosInstanceMock.get
            .mockResolvedValueOnce({
              data: `${htmlStart}<a id="link-0-0-p1" href="/details-coin1">Binance Will List coin1 (COIN1)</a>${htmlEnd}`,
            })
            .mockResolvedValueOnce({
              data: `${htmlStart}<div class="css-3fpgoh">Binance will list COIN1 at 2021-08-22 16:25 (UTC)</div>${htmlEnd}`,
            });
        });

        it('Then announcements list is returned', async () => {
          const result = await binanceCoinListingClient.getAllAnnouncements();
          expect(result).toEqual([
            {
              exchange: 'Binance',
              coin: 'COIN1',
              date: new Date('2021-08-22T16:25:00.000Z'),
              url: 'https://www.binance.com/details-coin1',
            },
          ]);

          expect(axiosInstanceMock.get).toHaveBeenCalledTimes(2);
          let getParams = axiosInstanceMock.get.mock.calls[0];
          expect(getParams?.length).toEqual(1);
          expect(getParams?.[0]).toEqual('https://www.binance.com/en/support/announcement/c-48');
          getParams = axiosInstanceMock.get.mock.calls[1];
          expect(getParams?.length).toEqual(1);
          expect(getParams?.[0]).toEqual('https://www.binance.com/details-coin1');
        });
      });
    });
  });
});
