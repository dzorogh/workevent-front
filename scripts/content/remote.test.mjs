import test from 'node:test';
import assert from 'node:assert/strict';
import { metadataFromResource, withPublicMetadata } from './remote.mjs';

test('metadataFromResource maps public canonicalUrl', () => {
  assert.equal(
    metadataFromResource({ title: 'T', canonicalUrl: 'https://workevent.ru/city/moskva-1' }).canonicalUrl,
    'https://workevent.ru/city/moskva-1',
  );
});

test('withPublicMetadata fills empty admin metadata from public GET', async () => {
  const pages = await withPublicMetadata(
    [{ id: 5, path: '/city/moskva-1', title: 'Мероприятия в Москве' }],
    'https://admin.workevent.ru',
    async (url) => {
      assert.match(String(url), /path=%2Fcity%2Fmoskva-1/);
      return {
        ok: true,
        json: async () => ({
          data: {
            metadata: {
              title: 'Мероприятия в Москве: конференции и выставки 2026 — Workevent',
              h1: 'Мероприятия в Москве: конференции и выставки 2026',
              robots: 'index,follow',
            },
          },
        }),
      };
    },
  );

  assert.equal(pages[0].metadata.h1, 'Мероприятия в Москве: конференции и выставки 2026');
  assert.match(pages[0].metadata.title, /2026/);
});
