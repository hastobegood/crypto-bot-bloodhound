import { MemoryCache } from '../../../../../src/code/infrastructure/common/cache/memory-cache';

const ttl = 100;

let memoryCache: MemoryCache;
beforeEach(() => {
  memoryCache = new MemoryCache(ttl);
});

describe('MemoryCache', () => {
  describe('Give a value to cache', () => {
    describe('When value was not already cached', () => {
      it('Then value is cached', async () => {
        await memoryCache.set('1', 'value');
        expect(await memoryCache.get('1')).toEqual('value');
      });
    });

    describe('When value was already cached', () => {
      it('Then new value is cached', async () => {
        await memoryCache.set('1', 'value');
        await memoryCache.set('1', 'new value');
        expect(await memoryCache.get('1')).toEqual('new value');
      });
    });
  });

  describe('Give a cached value', () => {
    describe('When ttl is has expired', () => {
      it('Then value is removed from cache', async () => {
        await memoryCache.set('1', 'value');
        await new Promise((resolve) => setTimeout(resolve, ttl + 10));
        expect(await memoryCache.get('1')).toBeNull();
      });
    });

    describe('When ttl is has not expired', () => {
      it('Then value is still in the cache', async () => {
        await memoryCache.set('1', 'value');
        await new Promise((resolve) => setTimeout(resolve, ttl - 10));
        expect(await memoryCache.get('1')).toEqual('value');
      });
    });
  });
});
