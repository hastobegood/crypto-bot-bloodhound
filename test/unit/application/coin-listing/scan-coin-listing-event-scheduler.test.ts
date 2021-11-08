import { mocked } from 'ts-jest/utils';
import { ScanCoinListingEventScheduler } from '../../../../src/code/application/coin-listing/scan-coin-listing-event-scheduler';
import { ScanCoinListingService } from '../../../../src/code/domain/coin-listing/scan-coin-listing-service';

const scanCoinListingServiceMock = mocked(jest.genMockFromModule<ScanCoinListingService>('../../../../src/code/domain/coin-listing/scan-coin-listing-service'), true);

let scanCoinListingEventScheduler: ScanCoinListingEventScheduler;
beforeEach(() => {
  scanCoinListingServiceMock.scan = jest.fn();

  scanCoinListingEventScheduler = new ScanCoinListingEventScheduler(scanCoinListingServiceMock);
});

describe('ScanCoinListingEventScheduler', () => {
  describe('Given coin listings to scan', () => {
    describe('When scan has failed', () => {
      beforeEach(() => {
        scanCoinListingServiceMock.scan.mockRejectedValue(new Error('Error occurred !'));
      });

      it('Then error is thrown', async () => {
        try {
          await scanCoinListingEventScheduler.process();
          fail();
        } catch (error) {
          expect((error as Error).message).toEqual('Error occurred !');
        }

        expect(scanCoinListingServiceMock.scan).toHaveBeenCalledTimes(1);
        const scanParams = scanCoinListingServiceMock.scan.mock.calls[0];
        expect(scanParams.length).toEqual(1);
        expect(scanParams[0]).toEqual('Binance');
      });
    });

    describe('When scan has succeeded', () => {
      beforeEach(() => {
        scanCoinListingServiceMock.scan = jest.fn().mockReturnValue({});
      });

      it('Then nothing is returned', async () => {
        await scanCoinListingEventScheduler.process();

        expect(scanCoinListingServiceMock.scan).toHaveBeenCalledTimes(1);
        const scanParams = scanCoinListingServiceMock.scan.mock.calls[0];
        expect(scanParams.length).toEqual(1);
        expect(scanParams[0]).toEqual('Binance');
      });
    });
  });
});
