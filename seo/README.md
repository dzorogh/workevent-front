# SEO-контент Workevent

Оператор Яндекса: `.cursor/skills/seo-yandex`. План слоёв и серого контура: `seo/plan-power.md`. Контракт двух ВЧ: `seo/plan-top1.md`.

Тексты посадочных и статьи блога живут в Laravel, не во фронте и не через публичный API.

Штатный путь: файлы в `content/` → `npm run content:lint` → `npm run content:apply -- --dry-run --only=path:/city/moskva-1` → `npm run content:apply -- --only=path:/city/moskva-1`.

Запись идёт в Filament admin API (`/api/admin/pages`, `/api/admin/posts`) с токеном из `.env.local` (`ADMIN_API_URL`, `ADMIN_API_TOKEN`). Публичный `POST /api/v1/posts` по-прежнему 405.

После ручных правок в Filament: `npm run content:pull`.

Dokploy-сидеры `scripts/seed-seo-*.php` и `npm run seo:seed-posts` — deprecated, запасной путь на один переход.

## Линт

```bash
npm run content:lint
```

Голос и запрещённые метафразы: `.cursor/rules/seo-content-lint.mdc`. Алиас: `npm run seo:lint-content`.

## Посадочные (pages)

- Рабочая копия: `content/pages/*.md` (ключ — `path`)
- Модель: `App\Models\Page` (+ metadata)
- Черновик JSON: `seo/pages-seed-priority.json` (не публикация)

## Статьи блога (posts)

- Рабочая копия: `content/posts/{id}.md` (ключ — `id`)
- Файлы `content/posts/new-*.md` — импорт без id, не apply-ить вслепую: сверьте title с живыми постами, иначе появятся дубли
- Модель: `App\Models\Post`
- Таблица: `title`, `content`, `user_id`, `created_at`, `updated_at`, `deleted_at`
- Обложка: Spatie media, коллекция `cover`. Через admin API обложку не заливать
- Slug в БД нет: URL = `https://workevent.ru/blog/{slug}-{id}`

Проверка: `GET https://admin.workevent.ru/api/v1/posts` и страница `/blog/...` на workevent.ru.
