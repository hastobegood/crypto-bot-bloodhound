import { randomFromList, randomString } from '../../random-test-builder';
import { Announcement } from '../../../../src/code/domain/announcement/model/announcement';

export const buildDefaultAnnouncements = (): Announcement[] => {
  return [buildDefaultAnnouncement(), buildDefaultAnnouncement()];
};

export const buildDefaultAnnouncement = (): Announcement => {
  return {
    exchange: randomFromList(['Binance']),
    coin: randomString(5),
    date: new Date(),
    url: randomString(20),
  };
};
