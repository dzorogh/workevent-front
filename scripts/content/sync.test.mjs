import test from 'node:test';
import assert from 'node:assert/strict';
import { planActions, metadataToApi, selectEntries } from './sync.mjs';

const page = {
  type: 'page',
  rel: 'pages/city-moskva-1.md',
  path: '/city/moskva-1',
  title: 'Мероприятия в Москве',
  metadata: { h1: 'Новый H1', robots: 'index,follow' },
  body: 'Текст',
};

test('selectEntries honors --only=path:/city/moskva-1', () => {
  const selected = selectEntries([page, { ...page, path: '/', rel: 'pages/home.md' }], {
    only: ['path:/city/moskva-1'],
  });
  assert.equal(selected.length, 1);
  assert.equal(selected[0].path, '/city/moskva-1');
});

test('planActions PUTs changed page and skips identical', () => {
  const remotePages = [
    {
      id: 9,
      path: '/city/moskva-1',
      title: 'Мероприятия в Москве',
      content: 'Текст',
      metadata: { h1: 'Старый H1', robots: 'index,follow' },
    },
  ];
  const actions = planActions([page], { pages: remotePages, posts: [] });
  assert.equal(actions[0].method, 'PUT');
  assert.equal(actions[0].id, 9);
  assert.deepEqual(actions[0].changed, ['metadata.h1']);

  const skip = planActions(
    [{ ...page, metadata: { h1: 'Старый H1', robots: 'index,follow' } }],
    { pages: remotePages, posts: [] },
  );
  assert.equal(skip[0].method, 'SKIP');
});

test('planActions POSTs missing page and fails missing post id', () => {
  const create = planActions([page], { pages: [], posts: [] });
  assert.equal(create[0].method, 'POST');

  const missingPost = planActions(
    [{ type: 'post', rel: 'posts/12.md', id: 12, title: 'T', metadata: {}, body: 'B' }],
    { pages: [], posts: [] },
  );
  assert.equal(missingPost[0].method, 'FAIL');
});

test('metadataToApi maps canonicalUrl', () => {
  assert.equal(metadataToApi({ canonicalUrl: 'https://workevent.ru/' }).canonical_url, 'https://workevent.ru/');
});
