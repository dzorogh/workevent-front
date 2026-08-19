---
name: seo-wordstat
description: >-
  Fetches and interprets Yandex Cloud Wordstat v2 for workevent.ru. Use when
  the user asks for Wordstat, частотности, topRequests, semantic core numbers,
  or to refresh seo/wordstat-report.json. Distinguishes exact vs broad;
  associations are not ranking targets.
---

# Wordstat: съём и чтение

API: Yandex Cloud Search API v2 `topRequests`. Доки: https://aistudio.yandex.ru/docs/ru/search-api/concepts/wordstat.html

Секреты (`YANDEX_API_KEY`, folder id, токены) в чат не писать. Только имена переменных, HTTP-статусы, фразы и числа.

## Запуск

```bash
npm run seo:wordstat
```

Нужны в `.env.local`: `YANDEX_API_KEY`. `YANDEX_API_FOLDER_ID` опционален — скрипт достаёт folder из ошибки Cloud, если ключа нет в env.

Скрипт: `scripts/fetch-wordstat.mjs`. Регион по умолчанию **225** (Россия), период last_30_days. Пишет **только** `seo/wordstat-report.json`.

## Куда класть цифры

| Куда | Что |
| --- | --- |
| `seo/wordstat-report.json` | полный съём (пишет скрипт) |
| `seo/semantic-core.json` → `wordstat.exact` | точные частотности по фразам ядра |
| `seo/semantic-core.json` → `top1Targets` | **не переписывать** после съёма |
| `seo/plan-top1.md` | таблицу частот — только если пользователь просит обновить план |

После съёма: скопировать `shows` в `wordstat.exact`. Кластеры и цели топ-1 не трогать. Скилл `seo-top1` — контракт URL.

## Как читать отчёт

Поле у каждой фразы в `queries[]`:

| Поле | Смысл | Для целей |
| --- | --- | --- |
| `shows` | exact: точное вхождение фразы в `results` за 30 дней | да, основная цифра |
| `broadShows` | `totalCount` по семе (широкое) | контекст, не цель |
| `topRelated` | соседние формулировки той же семы | варианты H1, не новые посадочные |
| `associations` | чужие запросы («афиша», «куда сходить») | **не цели** |

`exact ≠ broad`. «конференции москва» broad 16k не заменяет exact «конференции в москве» 8.5k и не даёт права плодить второй URL.

`discoveredTop` — смесь related + associations, отсортированная по count. Не выбирать из неё новую цель топ-1.

## Шум, не интент каталога

Ассоциации и related с этими маркерами игнорировать как цели:

- афиша, куда сходить, что посмотреть, праздник
- форумы / форум (часто корпоративный или городской шум, не B2B-каталог)
- Третьяковка, Манеж, музеи, интерьер, дети, спорт

Высокий exact при таком шуме = отклонённый ВЧ. Список: `recommendation.rejectedHf` в отчёте.

## После съёма не делать

- Не менять `top1Targets` и канонические URL
- Не брать в цели фразу только потому что она в `associations` или `discoveredTop`
- Не печатать ключи и folder id
- Не звать MCP Wordstat — скрипт закрывает API
