---
name: seo-top1
description: >-
  Enforces workevent.ru top-1 SEO contract: two Yandex queries, two canonical
  URLs, backend-only copy, no entertainment HF. Use when ranking, title/H1,
  landing texts, internal links, Wordstat targets, «конференции в москве»,
  «деловые мероприятия», months 2–3 of the SEO plan, or changing
  seo/semantic-core.json / seo/plan-top1.md.
---

# Топ-1: две фразы, два URL

Цель поиска — Яндекс. Контракт двух ВЧ: `seo/plan-top1.md`. Двигатель трафика и факторы: `seo/plan-power.md`, скилл `seo-yandex`. Ядро: `seo/semantic-core.json` → `top1Targets`.

## Канон (не менять без явной просьбы)

| Фраза | Exact (ориентир) | Только этот URL | Title / H1 |
| --- | ---: | --- | --- |
| конференции в москве | 8528 | `/city/moskva-1` | H1 не крутить. Title — эта фраза; год только если в городе есть живые даты |
| деловые мероприятия | 4403 | `/` | эта фраза; «бизнес мероприятия» — синоним на той же главной |

`/events` и `/schedule/2026` — вспомогательные. Другие title/H1, ссылки на канон. Третий URL под тот же интент не плодить.

## Запрещено брать в топ-1

Даже если Wordstat больше:

- мероприятия
- мероприятия в москве
- выставки в москве
- выставки в москве 2026 (резерв, не вторая цель)
- расписание выставок
- календарь мероприятий

Интент чужой: афиша, «куда сходить», музеи. Не писать под них посадочные и не сдвигать канон.

## Тексты только через бэк

Не хардкодить title/H1/description/MDX во фронте. Не вызывать `POST /api/v1/posts` (405).

1. Правка `seo/pages-seed-priority.json` или `seo/posts-seed.json`
2. `npm run seo:lint-content` — при срабатывании переписать, не сидить
3. Сид через Dokploy: правило `.cursor/rules/seo-backend-seed.mdc`, команды в `seo/README.md`

Голос и запрещённые метафразы: `.cursor/rules/seo-content-lint.mdc`.

## Не трогать

- Контент карточек мероприятий (названия, описания, даты в каталоге) — наполняет редакция
- Кластеры и `top1Targets` в `seo/semantic-core.json` после свежего Wordstat — обновить можно только цифры в `wordstat.exact`
- Генерацию «ещё 50 городов» одним шаблоном
- GPTZero / Originality / «AI %»

## Перелинковка

- Главная и отрасли → `/city/moskva-1` («Конференции в Москве»)
- Карточка события: город — ссылка на `/city/{slug}`, не новый канон
- Статьи блога усиливают канон ссылкой на Москву, не конкурируют title

## После правок

Wordstat не переписывает ядро целиком. Свежие частотности — в `seo/wordstat-report.json` и блок `wordstat` ядра. Цели и URL остаются.
