import { randomAsset, randomFromList, randomString } from '@hastobegood/crypto-bot-artillery/test/builders';

import { Announcement } from '../../../../src/code/domain/announcement/model/announcement';

export const buildDefaultAnnouncements = (): Announcement[] => {
  return [buildDefaultAnnouncement(), buildDefaultAnnouncement()];
};

export const buildDefaultAnnouncement = (): Announcement => {
  return {
    exchange: randomFromList(['Binance']),
    coin: randomAsset(),
    date: new Date(),
    url: randomString(),
  };
};
