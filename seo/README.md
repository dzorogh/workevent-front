# SEO-контент Workevent

Тексты посадочных и статьи блога пишутся в Laravel (Dokploy), не во фронт и не через публичный API.

Публичный `POST /api/v1/posts` = **405**. Filament → Posts есть, но штатный путь в репозитории — seed-скрипт.

## Линт

```bash
npm run seo:lint-content
```

Голос и запрещённые метафразы: `.cursor/rules/seo-content-lint.mdc`.

## Посадочные (pages)

- JSON: `seo/pages-seed-priority.json`
- Сидер: `scripts/seed-seo-pages.php`
- Модель: `App\Models\Page` (+ metadata)

Скопировать файлы в контейнер и выполнить `php` с `LARAVEL_ROOT=/var/www/html`. Либо интерактивно:

```bash
npm run dokploy:shell:backend
```

## Статьи блога (posts)

- JSON: `seo/posts-seed.json`
- Сидер: `scripts/seed-seo-posts.php`
- Модель: `App\Models\Post`
- Таблица: `title`, `content`, `user_id`, `created_at`, `updated_at`, `deleted_at`
- Обложка: Spatie media, коллекция `cover` (обязательна для карточки на фронте). Сидер копирует cover с уже существующего поста.
- Slug в БД нет: URL = `https://workevent.ru/blog/{slug}-{id}`

```bash
npm run seo:lint-content
npm run seo:seed-posts
```

Эквивалент вручную: `npm run dokploy:shell:backend`, затем в контейнере `workevent-backend-*-app-1`:

```bash
LARAVEL_ROOT=/var/www/html php /tmp/seed-seo-posts.php /tmp/posts-seed.json
```

Проверка: `GET https://admin.workevent.ru/api/v1/posts` и страница `/blog/...` на workevent.ru.

Имя приложения в `.env.local` (`DOCKPLOY_BACKEND_APP_NAME`) может устареть: резолвер ищет бегущий `workevent-backend-*-app-1`.
