# Контур обновления контента на бэке

Дата: 2026-08-20  
Репозитории: `workevent-front` (файлы + CLI), `workevent-back` (Filament API).

Агент в Cursor обновляет живые `Page` и `Post` в Laravel. Публичный `/api/v1` остаётся только GET. Свой write-контроллер не пишем.

## Цель

Один повторяемый путь: файл → lint → diff → запись через Filament API. Тот же CLI годится не только для SEO: следующая сущность — ещё одна папка и маппинг на Filament-ресурс, не новый пайплайн.

Команды называются `content:*`, не `seo:*`.

## Роли истинны

| Слой | Роль |
| --- | --- |
| Файлы в `workevent-front/content/` | Рабочая копия агента, ревью в git, вход линтера |
| БД Laravel | Живой контент сайта |
| Filament UI | Ручной запасной вход в те же модели |
| Публичный `GET /api/v1/pages` и `/api/v1/posts` | Чтение сайтом и `content:diff` |

Запись только через admin API пакета. Нет автоматической двухсторонней синхронизации: после правок в Filament агент делает `content:pull`, иначе следующий apply затрёт их.

## Поверхность записи (бэкенд)

Пакет: `rupadana/filament-api-service` v4 (Filament 4, Laravel 12). Уже есть: Filament-ресурсы Page и Post, Sanctum в composer, `nextjs:revalidate` на `saved`.

Подключить пакет, зарегистрировать `ApiServicePlugin` в `AdminPanelProvider`, выполнить `make:filament-api-service` для Page и Post. Маршруты на том же хосте, что и публичный API (`admin.workevent.ru`):

| Метод | URL | Назначение |
| --- | --- | --- |
| GET | `/api/admin/pages?filter[path]=/city/moskva-1` | Резолв `id` (в публичном `/v1/pages` поля `id` нет) |
| PUT | `/api/admin/pages/{id}` | Обновление |
| POST | `/api/admin/pages` | Создание |
| GET/PUT/POST | `/api/admin/posts` | То же по `id` |

На `User` добавить `HasApiTokens`. Токен выпускается в Token resource пакета и кладётся только в gitignored `.env.local` фронта (`ADMIN_API_URL`, `ADMIN_API_TOKEN`). Значение токена не попадает в чат, логи и git.

Filament Shield в проекте нет. Политику токенов пакета выключаем (`models.token.enable_policy` = false). Выпускать токен может любой пользователь, у которого уже есть `canAccessPanel`. Отдельную роль `super_admin` не вводим.

`ADMIN_API_URL` — origin без пути, например хост админки. CLI клеит `/api/admin/pages` сам. Не класть в переменную ни `/api`, ни `/api/v1`.

Публичный `/api/v1/*` не меняем: без POST/PUT, фронт сайта как читал `GET /v1/pages?path=`, так и читает.

### Metadata

SEO-поля живут в `morphOne` `metadata`, не в колонках `pages`. Дефолтный handler пакета обновит только `path`, `title`, `content`.

Свой контроллер не пишем. В сгенерированных Create/Update handler Pages — `updateOrCreate` metadata в одной транзакции с полями страницы. Без транзакции нельзя: иначе возможен «текст записался, H1 нет».

В первом объёме пишем только поля, которыми уже пользуется публичный `MetadataResource` и текущие сиды: `title`, `h1`, `description`, `keywords`, `robots`, `canonical_url`. Open Graph и Twitter не трогаем, пока агент их явно не ведёт в файлах.

### Посты и обложки

`Post::creating` требует `Auth`. Sanctum-пользователь токена подходит, `user_id` проставится сам.

Ключ поста — `id`, не `title`. Смена заголовка не создаёт вторую статью.

Обложки через API не заливаем. Cover по-прежнему в Filament или копией donor-медиа, как сейчас. CLI не принимает и не выдумывает чужие CDN URL.

## Файлы (фронтенд)

Один Markdown на сущность:

```text
content/pages/home.md
content/pages/city-moskva-1.md
content/pages/industry-it.md
content/pages/schedule-2026.md
content/posts/12.md
```

Имя файла — удобная метка. Источник истины для записи:

- страница — `path` во frontmatter;
- пост — `id` во frontmatter (у нового поста поля нет).

Пример страницы:

```md
---
path: /city/moskva-1
title: Мероприятия в Москве
metadata:
  title: Конференции в Москве 2026 — Workevent
  h1: Конференции в Москве: выставки и форумы 2026
  description: …
  keywords: …
  robots: index,follow
---

Текст в Markdown / MDX.
```

Главная `/` входит в набор (в текущем seed её нет). На сайте главная уже берёт title/H1 из `GET /v1/pages?path=/`. Вывод `page.content` на `/` в этот объём не входит: фронт его сейчас не рендерит.

Каталог `seo/` остаётся для ядра, брифов, Wordstat и планов. Это не рабочая копия живых страниц.

## CLI

Три команды в `workevent-front`:

| Команда | Поведение |
| --- | --- |
| `npm run content:pull` | Список и тела берёт с admin API (`GET /api/admin/pages`, `GET /api/admin/posts`). Публичный `/v1/pages` не умеет отдавать каталог — только одну страницу по `path`, без `id`. |
| `npm run content:lint` | Существующие правила голоса редакции по `content/**` |
| `npm run content:apply [--only=…] [--dry-run]` | Линт → diff → запись только отличий |

`apply` без `--only` не публикует «весь каталог на всякий случай». Он заливает только файлы, которые отличаются от живых, либо явный `--only` (`--only=pages/city-moskva-1`, `--only=path:/`, `--only=posts/12`).

Алгоритм `apply` для страницы: lint → GET admin по `path` → нет записи и не dry-run → POST; есть и есть diff → PUT; нет diff → пропуск. Для поста с `id` → PUT; `PUT` 404 → ошибка, новый id не создаём. Для поста без `id` → POST, затем дописать `id` в frontmatter.

`--dry-run` печатает метод, ключ и список полей, HTTP-запись не делает.

Токен читается из `.env.local` и не печатается в stdout/stderr даже при ошибке.

## Ошибки

- Нет токена, 401, 403 — сразу стоп, без частичных записей. В тексте ошибки: создать токен в Filament и положить в `.env.local` (`ADMIN_API_TOKEN`). Значение не показывать.
- Линт не прошёл — HTTP не вызываем.
- `422` и сеть — этот файл помечается FAIL, остальные продолжаются. В конце таблица OK/FAIL/SKIP и exit 1, если был хотя бы один FAIL.
- Страница: `PUT` 404 → `POST` с тем же `path`.
- Пост: `PUT` 404 → FAIL, не создавать дубль.
- Pull перезаписывает локальные файлы. Отдельной защиты от грязного git нет.

## Миграция со старого контура

1. Бэкенд: пакет, `HasApiTokens`, плагин, API-service для Page и Post, хук metadata, политика токенов, выпуск токена в Filament.
2. Фронт: сконвертировать `seo/pages-seed-priority.json` и `seo/posts-seed.json` в `content/**`, добавить главную `/` через pull или вручную, CLI, обновить `seo/README.md` и `.cursor/rules/seo-backend-seed.mdc`.
3. Старые `scripts/seed-seo-*.php`, `seo:seed-posts` и заливка через Dokploy `/tmp` пометить deprecated. Не удалять в первом проходе: запасной путь на один переход.
4. Первый бой: `content:apply --dry-run`, затем точечно `/` и `/city/moskva-1`.

`scripts/generate-pages-seed.mjs` больше не путь публикации. Если генератор останется, его выход — черновик в `content/`, не прямой apply.

## Тесты

Бэкенд:

- без токена `/api/admin/pages` → 401;
- с токеном PUT страницы меняет `title`/`content` и metadata в одной транзакции;
- публичный `POST /api/v1/posts` по-прежнему недоступен (405 или маршрута нет).

Фронт:

- парсер Markdown/frontmatter;
- lint на фикстуре с запрещённой метафразой;
- diff/apply на моке fetch, без реального прода.

Прод в CI не вызываем.

## Вне объёма

- Свой write-контроллер и POST/PUT на публичном `/api/v1`
- Залив обложек и OG-картинок через API
- Рендер `page.content` на главной
- Генератор сидов как публикация
- Авто-apply из CI
- Laravel Loop / MCP как основной канал записи
- Массовая генерация новых городов и отраслей

## Критерий готовности

Агент может изменить H1 Москвы и title главной так: правка Markdown → `content:lint` → `content:apply --dry-run --only=…` → `content:apply --only=…`. Сайт после revalidate отдаёт новые metadata с `GET /v1/pages`. В чат и git токен не попадает. Dokploy-сидер для этого сценария не нужен.
