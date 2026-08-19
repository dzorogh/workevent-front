import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, serializeMarkdown, fileStemFromPath } from './markdown.mjs';

test('parseMarkdown reads path, title, metadata and body', () => {
  const parsed = parseMarkdown(`---
path: /city/moskva-1
title: Мероприятия в Москве
metadata:
  h1: Конференции в Москве
  robots: index,follow
---

Первый абзац.
`);

  assert.equal(parsed.path, '/city/moskva-1');
  assert.equal(parsed.title, 'Мероприятия в Москве');
  assert.equal(parsed.metadata.h1, 'Конференции в Москве');
  assert.equal(parsed.body, 'Первый абзац.');
});

test('serializeMarkdown round-trips', () => {
  const source = {
    path: '/',
    title: 'Каталог',
    metadata: { h1: 'Деловые мероприятия', robots: 'index,follow' },
    body: 'Текст.',
  };
  const again = parseMarkdown(serializeMarkdown(source));
  assert.equal(again.path, source.path);
  assert.equal(again.title, source.title);
  assert.equal(again.metadata.h1, source.metadata.h1);
  assert.equal(again.body, source.body);
});

test('fileStemFromPath maps home and nested paths', () => {
  assert.equal(fileStemFromPath('/'), 'home');
  assert.equal(fileStemFromPath('/city/moskva-1'), 'city-moskva-1');
  assert.equal(fileStemFromPath('/schedule/2026/horeca'), 'schedule-2026-horeca');
});
