# Content update via Filament API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Агент обновляет живые `Page` и `Post` через Filament admin API (`rupadana/filament-api-service`), а не через PHP в `/tmp` и не через публичный `/api/v1`.

**Architecture:** В `workevent-back` пакет генерирует `/api/admin/pages` и `/api/admin/posts` (Sanctum). В сгенерированных Page handlers — транзакционный `metadata()->updateOrCreate`. В `workevent-front` — Markdown в `content/**` и CLI `content:pull` / `content:lint` / `content:apply`. Публичный `/api/v1` остаётся только GET.

**Tech Stack:** Laravel 12, Filament 4, `rupadana/filament-api-service` ^4, Sanctum 4, Node `node:test`, Markdown + YAML frontmatter.

**Spec:** `docs/superpowers/specs/2026-08-20-content-update-filament-api-design.md`

**Репозитории:** задачи 1–6 — `/Users/dzorogh/Develop/workevent/workevent-back`. Задачи 7–12 — `/Users/dzorogh/Develop/workevent/workevent-front`. Не коммитить токены.

---

## File map

### workevent-back

| File | Role |
| --- | --- |
| `app/Models/User.php` | `HasApiTokens` |
| `app/Models/Page.php` | `HasAllowedFilters` для `filter[path]` |
| `app/Providers/Filament/AdminPanelProvider.php` | `ApiServicePlugin` |
| `config/api-service.php` | `enable_policy=false`, `use-spatie-permission-middleware=false` |
| `app/Filament/Resources/Pages/Api/PageApiService.php` | генерирует пакет |
| `app/Filament/Resources/Pages/Api/Handlers/CreateHandler.php` | create + metadata |
| `app/Filament/Resources/Pages/Api/Handlers/UpdateHandler.php` | update + metadata |
| `app/Filament/Resources/Pages/Api/Concerns/SyncsPageMetadata.php` | общий `updateOrCreate` metadata |
| `app/Filament/Resources/Posts/Api/*` | генерирует пакет, без кастома cover |
| `database/migrations/2026_08_20_000000_add_canonical_url_to_metadata_table.php` | колонки нет в исходной миграции, код уже читает её |
| `tests/Feature/PublicPostWriteTest.php` | публичный POST запрещён |
| `tests/Feature/AdminPageApiTest.php` | 401 и PUT+metadata |
| `tests/Feature/RoutesTest.php` | не дергать `/api/admin` и query-required маршруты |

### workevent-front

| File | Role |
| --- | --- |
| `scripts/content/markdown.mjs` | parse/serialize/scan |
| `scripts/content/sync.mjs` | diff и план действий (pure) |
| `scripts/content/remote.mjs` | env + fetch, токен не логировать |
| `scripts/content/apply.mjs` | CLI apply |
| `scripts/content/pull.mjs` | CLI pull |
| `scripts/content/import-from-seed.mjs` | JSON → `content/**` |
| `scripts/content/*.test.mjs` | `node:test` |
| `scripts/lint-seo-content.mjs` | default glob → `content/**` |
| `content/pages/*.md`, `content/posts/*.md` | рабочая копия |
| `package.json` | `content:*` |
| `seo/README.md`, `.cursor/rules/seo-backend-seed.mdc` | новый контур |
| `.env.example` | `ADMIN_API_URL`, пустой `ADMIN_API_TOKEN` |
| `scripts/seed-seo-*.php`, `scripts/dokploy-seed-posts.mjs` | deprecated-комментарий |

---

### Task 1: Lock public POST /api/v1/posts

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Feature/PublicPostWriteTest.php`
- Repo: `workevent-back`

- [ ] **Step 1: Write the test**

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class PublicPostWriteTest extends TestCase
{
    public function test_public_posts_collection_rejects_post(): void
    {
        $this->postJson('/api/v1/posts', [
            'title' => 'Should not be created',
            'content' => 'no',
        ])->assertStatus(405);
    }
}
```

- [ ] **Step 2: Run the test**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=PublicPostWriteTest`

Expected: PASS (маршрута POST нет, Laravel отвечает 405).

- [ ] **Step 3: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add tests/Feature/PublicPostWriteTest.php
git commit -m "$(cat <<'EOF'
test: lock public POST /api/v1/posts as 405

EOF
)"
```

---

### Task 2: Failing test — admin pages require Sanctum

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Feature/AdminPageApiTest.php`
- Repo: `workevent-back`

- [ ] **Step 1: Write the failing test**

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class AdminPageApiTest extends TestCase
{
    public function test_pages_index_requires_authentication(): void
    {
        $this->getJson('/api/admin/pages')->assertUnauthorized();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=test_pages_index_requires_authentication`

Expected: FAIL (404, маршрута ещё нет).

- [ ] **Step 3: Commit the failing test**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add tests/Feature/AdminPageApiTest.php
git commit -m "$(cat <<'EOF'
test: require auth on admin pages API

EOF
)"
```

---

### Task 3: Install Filament API Service and generate Page/Post APIs

**Files:**
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/app/Models/User.php`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/app/Providers/Filament/AdminPanelProvider.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/config/api-service.php` (publish)
- Create: generated `app/Filament/Resources/Pages/Api/**` and `app/Filament/Resources/Posts/Api/**`
- Repo: `workevent-back`

Spatie Permission / Filament Shield в проекте нет. Если оставить дефолт пакета `use-spatie-permission-middleware=true`, admin API упадёт с 500.

- [ ] **Step 1: Install the package**

Run:

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
composer require rupadana/filament-api-service:^4.0
php artisan vendor:publish --tag=api-service-config
```

Expected: `config/api-service.php` появился.

- [ ] **Step 2: Tighten published config**

В `config/api-service.php` выставить:

```php
'models' => [
    'token' => [
        'enable_policy' => false,
    ],
],
'use-spatie-permission-middleware' => false,
```

Остальное не менять, если ключи называются иначе — править те же смыслы: политика токенов выключена, middleware Spatie Permission выключен.

- [ ] **Step 3: Add HasApiTokens to User**

В `/Users/dzorogh/Develop/workevent/workevent-back/app/Models/User.php` добавить `use Laravel\Sanctum\HasApiTokens;` в импорты и в `use` модели:

```php
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
```

Миграция `personal_access_tokens` уже есть (`database/migrations/2024_11_09_101126_create_personal_access_tokens_table.php`). `php artisan install:api` не вызывать.

- [ ] **Step 4: Register the plugin**

В `AdminPanelProvider::panel()` после `->favicon(...)` добавить:

```php
use Rupadana\ApiService\ApiServicePlugin;
```

```php
->plugin(ApiServicePlugin::make());
```

- [ ] **Step 5: Generate API services**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
php artisan make:filament-api-service Pages/PageResource --no-interaction
php artisan make:filament-api-service Posts/PostResource --no-interaction
php artisan route:list --path=api/admin
```

Expected: в списке есть `api/admin/pages` и `api/admin/posts` (GET/POST/PUT/DELETE). Если artisan положил файлы не в `app/Filament/Resources/Pages/Api/`, в следующих задачах править фактические пути.

- [ ] **Step 6: Re-run the 401 test**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=test_pages_index_requires_authentication`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add composer.json composer.lock app/Models/User.php app/Providers/Filament/AdminPanelProvider.php config/api-service.php app/Filament/Resources/Pages/Api app/Filament/Resources/Posts/Api
git commit -m "$(cat <<'EOF'
feat: expose Filament Page and Post admin API

EOF
)"
```

---

### Task 4: PUT page writes content and metadata in one transaction

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/database/migrations/2026_08_20_000000_add_canonical_url_to_metadata_table.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Filament/Resources/Pages/Api/Concerns/SyncsPageMetadata.php`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/app/Models/Page.php`
- Modify: generated Page `CreateHandler.php` and `UpdateHandler.php`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Feature/AdminPageApiTest.php`
- Repo: `workevent-back`

В исходной миграции `metadata` нет `canonical_url`, но `MetadataResource` / Filament-форма уже его читают.

- [ ] **Step 1: Add the failing authenticated test to AdminPageApiTest**

Дописать в тот же класс (не удаляя тест 401):

```php
<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AdminPageApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_pages_index_requires_authentication(): void
    {
        $this->getJson('/api/admin/pages')->assertUnauthorized();
    }

    public function test_authenticated_put_updates_page_and_metadata(): void
    {
        Queue::fake();

        $user = User::factory()->create([
            'is_active' => true,
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $page = Page::query()->create([
            'path' => '/city/moskva-1',
            'title' => 'Old title',
            'content' => 'Old content',
        ]);
        $page->metadata()->create([
            'h1' => 'Old H1',
            'title' => 'Old meta',
            'robots' => 'index,follow',
        ]);

        $this->withToken($token)
            ->putJson('/api/admin/pages/'.$page->id, [
                'path' => '/city/moskva-1',
                'title' => 'Мероприятия в Москве',
                'content' => 'Новый текст',
                'metadata' => [
                    'title' => 'Конференции в Москве 2026 — Workevent',
                    'h1' => 'Конференции в Москве: выставки и форумы 2026',
                    'description' => 'Даты и площадки.',
                    'keywords' => 'конференции в москве',
                    'robots' => 'index,follow',
                    'canonical_url' => null,
                ],
            ])
            ->assertSuccessful();

        $page->refresh()->load('metadata');

        $this->assertSame('Мероприятия в Москве', $page->title);
        $this->assertSame('Новый текст', $page->content);
        $this->assertSame('Конференции в Москве: выставки и форумы 2026', $page->metadata->h1);
        $this->assertSame('Конференции в Москве 2026 — Workevent', $page->metadata->title);
        $this->assertSame('Даты и площадки.', $page->metadata->description);
    }
}
```

`Page::saved` ставит в очередь `nextjs:revalidate` — поэтому `Queue::fake()`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=test_authenticated_put_updates_page_and_metadata`

Expected: FAIL (metadata не обновится дефолтным `$model->fill($request->all())`). Если падает раньше из‑за БД — в `phpunit.xml` внутри `<php>` добавить:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

- [ ] **Step 3: Add canonical_url migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('metadata', 'canonical_url')) {
            return;
        }

        Schema::table('metadata', function (Blueprint $table) {
            $table->string('canonical_url')->nullable()->after('robots');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('metadata', 'canonical_url')) {
            return;
        }

        Schema::table('metadata', function (Blueprint $table) {
            $table->dropColumn('canonical_url');
        });
    }
};
```

- [ ] **Step 4: Allow filter[path] on Page**

В `app/Models/Page.php`:

```php
<?php

namespace App\Models;

use App\Contracts\HasMetadataContract;
use App\Traits\HasMetadata;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Artisan;
use Rupadana\ApiService\Contracts\HasAllowedFilters;
use Spatie\QueryBuilder\AllowedFilter;

class Page extends Model implements HasMetadataContract, HasAllowedFilters
{
    use HasMetadata;

    protected $fillable = [
        'path',
        'content',
        'title',
    ];

    public static function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('path'),
        ];
    }

    public static function boot()
    {
        parent::boot();

        static::saved(function (Page $page) {
            Artisan::queue('nextjs:revalidate');
        });
    }
}
```

- [ ] **Step 5: Add SyncsPageMetadata concern**

```php
<?php

namespace App\Filament\Resources\Pages\Api\Concerns;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait SyncsPageMetadata
{
    /**
     * @param  array<string, mixed>|null  $payload
     */
    protected function persistPage(Page $page, array $attributes, ?array $payload): Page
    {
        return DB::transaction(function () use ($page, $attributes, $payload) {
            $page->fill($attributes);
            $page->save();

            if ($payload === null) {
                return $page->load('metadata');
            }

            $page->metadata()->updateOrCreate(
                [],
                [
                    'title' => $payload['title'] ?? null,
                    'h1' => $payload['h1'] ?? null,
                    'description' => $payload['description'] ?? null,
                    'keywords' => $payload['keywords'] ?? null,
                    'robots' => $payload['robots'] ?? 'index,follow',
                    'canonical_url' => $payload['canonical_url'] ?? null,
                ],
            );

            return $page->load('metadata');
        });
    }

    /**
     * @return array{0: array<string, mixed>, 1: array<string, mixed>|null}
     */
    protected function pagePayload(Request $request): array
    {
        $metadata = $request->input('metadata');

        return [
            $request->only(['path', 'title', 'content']),
            is_array($metadata) ? $metadata : null,
        ];
    }
}
```

Если artisan положил handlers в другой namespace, namespace трейта сменить на соседний `Concerns`.

- [ ] **Step 6: Wire CreateHandler and UpdateHandler**

В сгенерированном `UpdateHandler` заменить тело `handler` на:

```php
use App\Filament\Resources\Pages\Api\Concerns\SyncsPageMetadata;
use Illuminate\Http\Request;

class UpdateHandler extends Handlers
{
    use SyncsPageMetadata;

    public function handler(Request $request)
    {
        $id = $request->route('id');
        $model = static::getModel()::find($id);

        if (! $model) {
            return static::sendNotFoundResponse();
        }

        [$attributes, $metadata] = $this->pagePayload($request);
        $model = $this->persistPage($model, $attributes, $metadata);

        return static::sendSuccessResponse($model, 'Successfully Update Resource');
    }
}
```

В `CreateHandler`:

```php
use App\Filament\Resources\Pages\Api\Concerns\SyncsPageMetadata;
use App\Models\Page;
use Illuminate\Http\Request;

class CreateHandler extends Handlers
{
    use SyncsPageMetadata;

    public function handler(Request $request)
    {
        [$attributes, $metadata] = $this->pagePayload($request);
        $model = $this->persistPage(new Page(), $attributes, $metadata);

        return static::sendSuccessResponse($model, 'Successfully Create Resource');
    }
}
```

Имена базового класса и сигнатуру `handler` оставить как в сгенерированном файле, если они отличаются от этого фрагмента.

Посты не кастомизировать: cover через API не заливаем.

- [ ] **Step 7: Run tests**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=AdminPageApiTest`

Expected: оба теста PASS.

- [ ] **Step 8: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add app/Models/Page.php app/Filament/Resources/Pages/Api tests/Feature/AdminPageApiTest.php database/migrations/2026_08_20_000000_add_canonical_url_to_metadata_table.php phpunit.xml
git commit -m "$(cat <<'EOF'
feat: persist page metadata through admin API

EOF
)"
```

---

### Task 5: Stop RoutesTest from hitting admin API

**Files:**
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Feature/RoutesTest.php`
- Repo: `workevent-back`

Сейчас тест делает GET по всем `api/*` и ждёт 200. После Task 3 он сломается на `/api/admin/*` (401) и на `/api/v1/pages` без `path` (422).

- [ ] **Step 1: Replace the filter**

```php
<?php

namespace Tests\Feature;

use Illuminate\Routing\Route as IlluminateRoute;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RoutesTest extends TestCase
{
    public function test_public_index_get_routes_are_accessible(): void
    {
        $uris = collect(Route::getRoutes())
            ->filter(function (IlluminateRoute $route) {
                if (! in_array('GET', $route->methods(), true)) {
                    return false;
                }

                $uri = $route->uri();

                if (! str_starts_with($uri, 'api/v1/')) {
                    return false;
                }

                if (str_contains($uri, '{')) {
                    return false;
                }

                return ! in_array($uri, ['api/v1/pages', 'api/v1/metadata'], true);
            })
            ->map(fn (IlluminateRoute $route) => $route->uri());

        foreach ($uris as $uri) {
            $this->getJson('/'.$uri)->assertStatus(200);
        }
    }
}
```

- [ ] **Step 2: Run the test**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=RoutesTest`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add tests/Feature/RoutesTest.php
git commit -m "$(cat <<'EOF'
test: skip admin and query-required routes in GET sweep

EOF
)"
```

---

### Task 6: Backend smoke after deploy

**Files:** none in git. Repo: `workevent-back` на Dokploy.

- [ ] **Step 1: Deploy backend and migrate**

На проде: задеплоить ветку, затем `php artisan migrate` (колонка `canonical_url`). Не печатать секреты.

- [ ] **Step 2: Create a Sanctum token in Filament**

В админке открыть Token resource пакета, выпустить токен на активного пользователя панели. Значение записать только в gitignored `/Users/dzorogh/Develop/workevent/workevent-front/.env.local`:

```
ADMIN_API_URL=https://admin.workevent.ru
ADMIN_API_TOKEN=
```

В чат, git и логи значение не копировать. В `.env.local` не должно быть `/api` в `ADMIN_API_URL`.

- [ ] **Step 3: Sanity-check without leaking the token**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
node --input-type=module -e "
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('.env.local','utf8').split('\n').flatMap((l) => {
  const m = l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  return m ? [[m[1], m[2]]] : [];
}));
const res = await fetch(env.ADMIN_API_URL.replace(/\/$/, '') + '/api/admin/pages?filter[path]=/city/moskva-1', {
  headers: { authorization: 'Bearer ' + env.ADMIN_API_TOKEN, accept: 'application/json' },
});
console.log(res.status);
"
```

Expected: `200`. Если `401`/`403` — токен или URL неверны. Тело ответа в чат не обязательно; id страницы не секрет.

Коммит в этой задаче не нужен.

---

### Task 7: Markdown parser and serializer

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/markdown.mjs`
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/markdown.test.mjs`
- Repo: `workevent-front`

Зависимость `js-yaml` уже в `overrides`. Если `import yaml from 'js-yaml'` не резолвится — `npm install js-yaml`.

- [ ] **Step 1: Write the failing tests**

```js
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
  assert.deepEqual(again, { ...source, id: undefined, type: 'page' });
});

test('fileStemFromPath maps home and nested paths', () => {
  assert.equal(fileStemFromPath('/'), 'home');
  assert.equal(fileStemFromPath('/city/moskva-1'), 'city-moskva-1');
  assert.equal(fileStemFromPath('/schedule/2026/horeca'), 'schedule-2026-horeca');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && node --test scripts/content/markdown.test.mjs`

Expected: FAIL (модуля нет).

- [ ] **Step 3: Implement markdown.mjs**

```js
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import yaml from 'js-yaml';

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export function parseMarkdown(source, { type } = {}) {
  const match = source.match(FRONTMATTER);
  if (!match) {
    throw new Error('Missing YAML frontmatter');
  }

  const data = yaml.load(match[1]) ?? {};
  const body = match[2].replace(/\s+$/, '');
  const inferred = type ?? (data.path ? 'page' : 'post');

  return {
    type: inferred,
    id: data.id,
    path: data.path,
    title: data.title ?? '',
    metadata: data.metadata ?? {},
    body,
  };
}

export function serializeMarkdown(entry) {
  const front = {
    ...(entry.id != null ? { id: entry.id } : {}),
    ...(entry.path != null ? { path: entry.path } : {}),
    title: entry.title,
    ...(entry.metadata && Object.keys(entry.metadata).length > 0
      ? { metadata: entry.metadata }
      : {}),
  };

  return `---\n${yaml.dump(front, { lineWidth: 120 }).trim()}\n---\n\n${entry.body}\n`;
}

export function fileStemFromPath(path) {
  if (path === '/') return 'home';
  return path.replace(/^\//, '').replaceAll('/', '-');
}

export function loadContentTree(rootDir) {
  const out = [];
  for (const kind of ['pages', 'posts']) {
    const dir = join(rootDir, kind);
    let entries = [];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!name.endsWith('.md')) continue;
      const full = join(dir, name);
      if (!statSync(full).isFile()) continue;
      out.push({
        rel: relative(rootDir, full).replaceAll('\\', '/'),
        ...parseMarkdown(readFileSync(full, 'utf8'), {
          type: kind === 'pages' ? 'page' : 'post',
        }),
      });
    }
  }
  return out;
}
```

Поправить тест `round-trips`, если `yaml.dump` добавляет лишние ключи: сравнивать `path`, `title`, `metadata.h1`, `body`, не весь объект.

- [ ] **Step 4: Run tests**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && node --test scripts/content/markdown.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
git add scripts/content/markdown.mjs scripts/content/markdown.test.mjs package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat: parse content markdown with frontmatter

EOF
)"
```

`package.json` добавлять в commit только если ставили `js-yaml`.

---

### Task 8: Pure diff and apply plan

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/sync.mjs`
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/sync.test.mjs`
- Repo: `workevent-front`

- [ ] **Step 1: Write failing tests**

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && node --test scripts/content/sync.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Implement sync.mjs**

```js
export function metadataToApi(metadata = {}) {
  return {
    title: metadata.title ?? null,
    h1: metadata.h1 ?? null,
    description: metadata.description ?? null,
    keywords: metadata.keywords ?? null,
    robots: metadata.robots ?? 'index,follow',
    canonical_url: metadata.canonical_url ?? metadata.canonicalUrl ?? null,
  };
}

export function selectEntries(entries, { only = [] } = {}) {
  if (only.length === 0) return entries;

  return entries.filter((entry) =>
    only.some((raw) => {
      if (raw.startsWith('path:')) return entry.path === raw.slice(5);
      if (raw.startsWith('posts/')) return entry.rel === raw || entry.rel === `posts/${raw.slice(6)}`.replace(/\.md$/, '') + '.md';
      if (raw.startsWith('pages/')) return entry.rel === raw || entry.rel === raw.replace(/\.md$/, '') + '.md';
      return entry.rel === raw || entry.rel === `${raw}.md`;
    }),
  );
}

function normalizeMeta(metadata) {
  const api = metadataToApi(metadata ?? {});
  return JSON.stringify(api);
}

function pageFingerprint(title, content, metadata) {
  return JSON.stringify({ title, content, metadata: normalizeMeta(metadata) });
}

export function planActions(entries, remote) {
  const pagesByPath = new Map((remote.pages ?? []).map((p) => [p.path, p]));
  const postsById = new Map((remote.posts ?? []).map((p) => [String(p.id), p]));
  const actions = [];

  for (const entry of entries) {
    if (entry.type === 'page') {
      if (!entry.path) {
        actions.push({ method: 'FAIL', entry, error: 'page without path' });
        continue;
      }
      const current = pagesByPath.get(entry.path);
      const nextFp = pageFingerprint(entry.title, entry.body, entry.metadata);
      if (!current) {
        actions.push({
          method: 'POST',
          entry,
          url: '/api/admin/pages',
          body: {
            path: entry.path,
            title: entry.title,
            content: entry.body,
            metadata: metadataToApi(entry.metadata),
          },
          changed: ['path', 'title', 'content', 'metadata'],
        });
        continue;
      }
      const prevFp = pageFingerprint(current.title, current.content, current.metadata);
      if (prevFp === nextFp) {
        actions.push({ method: 'SKIP', entry, id: current.id });
        continue;
      }
      const changed = [];
      if (current.title !== entry.title) changed.push('title');
      if ((current.content ?? '') !== entry.body) changed.push('content');
      if (normalizeMeta(current.metadata) !== normalizeMeta(entry.metadata)) changed.push('metadata.h1');
      actions.push({
        method: 'PUT',
        entry,
        id: current.id,
        url: `/api/admin/pages/${current.id}`,
        body: {
          path: entry.path,
          title: entry.title,
          content: entry.body,
          metadata: metadataToApi(entry.metadata),
        },
        changed: changed.length ? changed : ['content'],
      });
      continue;
    }

    if (entry.id == null) {
      actions.push({
        method: 'POST',
        entry,
        url: '/api/admin/posts',
        body: { title: entry.title, content: entry.body },
        changed: ['title', 'content'],
      });
      continue;
    }

    const current = postsById.get(String(entry.id));
    if (!current) {
      actions.push({ method: 'FAIL', entry, error: `post id=${entry.id} not found` });
      continue;
    }
    if (current.title === entry.title && (current.content ?? '') === entry.body) {
      actions.push({ method: 'SKIP', entry, id: entry.id });
      continue;
    }
    actions.push({
      method: 'PUT',
      entry,
      id: entry.id,
      url: `/api/admin/posts/${entry.id}`,
      body: { title: entry.title, content: entry.body },
      changed: ['title', 'content'],
    });
  }

  return actions;
}
```

Если тест `--only=posts/12` будет хрупким из‑за нормализации rel — поправить `selectEntries`, не ослаблять assert.

- [ ] **Step 4: Run tests**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && node --test scripts/content/sync.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
git add scripts/content/sync.mjs scripts/content/sync.test.mjs
git commit -m "$(cat <<'EOF'
feat: plan content apply actions from local vs remote

EOF
)"
```

---

### Task 9: Remote client, apply CLI, mocked HTTP tests

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/remote.mjs`
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/apply.mjs`
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/apply.test.mjs`
- Repo: `workevent-front`

Токен никогда не интерполировать в строки логов, ошибок и `JSON.stringify(env)`.

- [ ] **Step 1: Write apply.test.mjs**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyActions } from './apply.mjs';

test('applyActions dry-run does not fetch writes', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init?.method ?? 'GET' });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const summary = await applyActions(
    [
      {
        method: 'PUT',
        url: '/api/admin/pages/9',
        body: { title: 'X' },
        entry: { rel: 'pages/home.md', path: '/' },
        changed: ['title'],
      },
    ],
    { dryRun: true, fetchImpl, request: async () => ({}) },
  );

  assert.equal(summary.dryRun, 1);
  assert.equal(calls.length, 0);
});

test('applyActions stops before writes on 401', async () => {
  await assert.rejects(
    () =>
      applyActions(
        [{ method: 'POST', url: '/api/admin/pages', body: {}, entry: { rel: 'pages/home.md' } }],
        {
          dryRun: false,
          request: async () => {
            const err = new Error('Admin API 401. Create a token in Filament and set ADMIN_API_TOKEN in .env.local');
            err.status = 401;
            throw err;
          },
        },
      ),
    /ADMIN_API_TOKEN/,
  );
});

test('applyActions continues after 422 and exits with fail', async () => {
  const methods = [];
  const summary = await applyActions(
    [
      {
        method: 'PUT',
        url: '/api/admin/pages/1',
        body: {},
        entry: { rel: 'pages/a.md', path: '/a' },
      },
      {
        method: 'PUT',
        url: '/api/admin/pages/2',
        body: {},
        entry: { rel: 'pages/b.md', path: '/b' },
      },
    ],
    {
      dryRun: false,
      request: async (url) => {
        methods.push(url);
        if (url.endsWith('/1')) {
          const err = new Error('422');
          err.status = 422;
          throw err;
        }
        return { id: 2 };
      },
    },
  );

  assert.equal(summary.fail, 1);
  assert.equal(summary.ok, 1);
  assert.equal(methods.length, 2);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && node --test scripts/content/apply.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Implement remote.mjs**

```js
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadAdminEnv(root) {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // .env.local optional if vars already exported
  }

  const baseUrl = (env.ADMIN_API_URL ?? '').replace(/\/$/, '');
  const token = env.ADMIN_API_TOKEN ?? '';
  if (!baseUrl) {
    throw new Error('Set ADMIN_API_URL in .env.local (origin only, no /api)');
  }
  if (!token) {
    throw new Error('Create a token in Filament and set ADMIN_API_TOKEN in .env.local');
  }
  if (baseUrl.endsWith('/api') || baseUrl.endsWith('/api/v1')) {
    throw new Error('ADMIN_API_URL must be the origin only, without /api');
  }

  return { baseUrl, token };
}

export function createAdminClient({ baseUrl, token, fetchImpl = fetch }) {
  async function request(path, { method = 'GET', body } = {}) {
    const res = await fetchImpl(`${baseUrl}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 || res.status === 403) {
      const err = new Error('Admin API 401/403. Create a token in Filament and set ADMIN_API_TOKEN in .env.local');
      err.status = res.status;
      throw err;
    }

    if (!res.ok) {
      const err = new Error(`Admin API ${res.status}`);
      err.status = res.status;
      throw err;
    }

    return res.status === 204 ? null : res.json();
  }

  async function listAll(path) {
    const items = [];
    let page = 1;
    let lastPage = 1;
    do {
      const json = await request(`${path}${path.includes('?') ? '&' : '?'}page=${page}`);
      const chunk = json.data ?? json;
      if (Array.isArray(chunk)) items.push(...chunk);
      lastPage = json.meta?.last_page ?? json.last_page ?? 1;
      page += 1;
    } while (page <= lastPage);
    return items;
  }

  return { request, listAll };
}
```

- [ ] **Step 4: Implement apply.mjs (library + CLI)**

```js
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContentTree } from './markdown.mjs';
import { createAdminClient, loadAdminEnv } from './remote.mjs';
import { planActions, selectEntries } from './sync.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

export async function applyActions(actions, { dryRun, request }) {
  const summary = { ok: 0, fail: 0, skip: 0, dryRun: 0, rows: [] };

  if (!dryRun) {
    try {
      await request('/api/admin/pages');
    } catch (err) {
      if (err.status === 401 || err.status === 403) throw err;
    }
  }

  for (const action of actions) {
    const key = action.entry.path ?? action.entry.rel;
    if (action.method === 'SKIP') {
      summary.skip += 1;
      summary.rows.push({ key, result: 'SKIP' });
      continue;
    }
    if (action.method === 'FAIL') {
      summary.fail += 1;
      summary.rows.push({ key, result: 'FAIL', error: action.error });
      continue;
    }
    if (dryRun) {
      summary.dryRun += 1;
      summary.rows.push({ key, result: 'DRY', method: action.method, changed: action.changed });
      continue;
    }
    try {
      await request(action.url, { method: action.method, body: action.body });
      summary.ok += 1;
      summary.rows.push({ key, result: 'OK', method: action.method });
    } catch (err) {
      if (err.status === 401 || err.status === 403) throw err;
      if (action.method === 'PUT' && err.status === 404 && action.entry.type === 'page') {
        try {
          await request('/api/admin/pages', {
            method: 'POST',
            body: action.body,
          });
          summary.ok += 1;
          summary.rows.push({ key, result: 'OK', method: 'POST' });
          continue;
        } catch (postErr) {
          if (postErr.status === 401 || postErr.status === 403) throw postErr;
          summary.fail += 1;
          summary.rows.push({ key, result: 'FAIL', error: String(postErr.message) });
          continue;
        }
      }
      summary.fail += 1;
      summary.rows.push({ key, result: 'FAIL', error: String(err.message) });
    }
  }

  return summary;
}

function parseArgs(argv) {
  const only = [];
  let dryRun = false;
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else if (arg.startsWith('--only=')) only.push(arg.slice(7));
  }
  return { only, dryRun };
}

function runLint() {
  const result = spawnSync('node', ['scripts/lint-seo-content.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error('content:lint failed; HTTP not called');
  }
}

async function main() {
  const { only, dryRun } = parseArgs(process.argv.slice(2));
  runLint();
  const { baseUrl, token } = loadAdminEnv(root);
  const client = createAdminClient({ baseUrl, token });
  const [pages, posts] = await Promise.all([
    client.listAll('/api/admin/pages'),
    client.listAll('/api/admin/posts'),
  ]);
  const entries = selectEntries(loadContentTree(resolve(root, 'content')), { only });
  const actions = planActions(entries, { pages, posts });
  const summary = await applyActions(actions, { dryRun, request: client.request });
  for (const row of summary.rows) {
    console.log(`${row.result}\t${row.key}\t${row.method ?? ''}\t${row.changed?.join(',') ?? row.error ?? ''}`);
  }
  if (summary.fail > 0) process.exit(1);
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isCli) {
  main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}
```

- [ ] **Step 5: Run tests**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && node --test scripts/content/apply.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
git add scripts/content/remote.mjs scripts/content/apply.mjs scripts/content/apply.test.mjs
git commit -m "$(cat <<'EOF'
feat: apply content diffs through Filament admin API

EOF
)"
```

---

### Task 10: Pull CLI, lint defaults, npm scripts

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/pull.mjs`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/lint-seo-content.mjs`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/package.json`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/.env.example`
- Repo: `workevent-front`

- [ ] **Step 1: Implement pull.mjs**

```js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fileStemFromPath, serializeMarkdown } from './markdown.mjs';
import { createAdminClient, loadAdminEnv } from './remote.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function writeEntry(rel, entry) {
  const full = resolve(root, 'content', rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, serializeMarkdown(entry));
  console.log(`WROTE content/${rel}`);
}

async function main() {
  const { baseUrl, token } = loadAdminEnv(root);
  const client = createAdminClient({ baseUrl, token });
  const [pages, posts] = await Promise.all([
    client.listAll('/api/admin/pages'),
    client.listAll('/api/admin/posts'),
  ]);

  for (const page of pages) {
    if (!page.path) continue;
    writeEntry(`pages/${fileStemFromPath(page.path)}.md`, {
      path: page.path,
      title: page.title ?? '',
      metadata: {
        title: page.metadata?.title ?? undefined,
        h1: page.metadata?.h1 ?? undefined,
        description: page.metadata?.description ?? undefined,
        keywords: page.metadata?.keywords ?? undefined,
        robots: page.metadata?.robots ?? 'index,follow',
        canonicalUrl: page.metadata?.canonical_url ?? page.metadata?.canonicalUrl ?? undefined,
      },
      body: page.content ?? '',
    });
  }

  for (const post of posts) {
    writeEntry(`posts/${post.id}.md`, {
      id: post.id,
      title: post.title ?? '',
      metadata: {},
      body: post.content ?? '',
    });
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
```

Admin transformer может отдавать metadata плоско или вложенно. Если после первого pull поля пустые — поправить маппинг под фактический JSON, не выдумывать вторую схему.

- [ ] **Step 2: Point lint at content/**

В `scripts/lint-seo-content.mjs` заменить `DEFAULT_FILES` на рекурсивный сбор `content/**/*.md`. Оставить возможность передать пути аргументами.

```js
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walkMd(dir, acc = []) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of names) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkMd(full, acc);
    else if (name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

const DEFAULT_FILES = walkMd(resolve(root, 'content'));
```

Сообщение об ошибке сменить на `content:lint failed: ${hits} hit(s). Rewrite, do not publish.`

- [ ] **Step 3: Add npm scripts and env example**

В `package.json` рядом с текущими seo-скриптами:

```json
"content:pull": "node scripts/content/pull.mjs",
"content:lint": "node scripts/lint-seo-content.mjs",
"content:apply": "node scripts/content/apply.mjs",
"content:test": "node --test scripts/content/*.test.mjs"
```

`seo:lint-content` оставить алиасом на тот же линтер.

В `.env.example` в конец:

```
# Filament admin API. Origin only, no /api. Token from Filament → Tokens. Never commit the value.
ADMIN_API_URL=https://admin.workevent.ru
ADMIN_API_TOKEN=
```

- [ ] **Step 4: Run unit tests**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && npm run content:test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
git add scripts/content/pull.mjs scripts/lint-seo-content.mjs package.json .env.example
git commit -m "$(cat <<'EOF'
feat: add content pull, lint, and apply commands

EOF
)"
```

---

### Task 11: Import seed JSON into content/ and add home stub

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/content/import-from-seed.mjs`
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/content/pages/*.md`
- Create: `/Users/dzorogh/Develop/workevent/workevent-front/content/posts/*.md`
- Repo: `workevent-front`

Городские path в JSON нет — только `cityTitle`. Id городов брать с публичного `GET {ADMIN_API_URL|/NEXT_PUBLIC_API_URL}/v1/cities` (без токена). Слаг как в `src/lib/globalUtils.js`.

Тексты в `pages-seed-priority.json` содержат запрещённые фразы. Import пишет как есть. `content:apply` не пройдёт, пока агент не перепишет хиты линтера. Это ожидаемо.

- [ ] **Step 1: Implement import-from-seed.mjs**

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import slugify from 'slugify';
import { fileStemFromPath, serializeMarkdown } from './markdown.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

function citySlug(title, id) {
  slugify.extend({ й: 'y', Й: 'Й' });
  return `${slugify(title, {
    lower: true,
    replacement: '-',
    trim: true,
    strict: true,
    locale: 'ru',
  }).slice(0, 60)}-${id}`;
}

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}

function write(rel, entry) {
  const full = resolve(root, 'content', rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, serializeMarkdown(entry));
}

async function main() {
  const env = loadEnv();
  const origin = (env.ADMIN_API_URL || env.NEXT_PUBLIC_API_URL || 'https://admin.workevent.ru').replace(/\/$/, '').replace(/\/api$/, '');
  const citiesRes = await fetch(`${origin}/api/v1/cities`);
  if (!citiesRes.ok) throw new Error(`GET /v1/cities ${citiesRes.status}`);
  const citiesJson = await citiesRes.json();
  const cities = new Map((citiesJson.data ?? []).map((c) => [c.title, c]));

  const pagesSeed = JSON.parse(readFileSync(resolve(root, 'seo/pages-seed-priority.json'), 'utf8'));
  for (const page of pagesSeed.pages ?? []) {
    let path = page.path;
    if (page.type === 'city') {
      const city = cities.get(page.cityTitle);
      if (!city) {
        console.error(`SKIP city (not in API): ${page.cityTitle}`);
        continue;
      }
      path = `/city/${citySlug(city.title, city.id)}`;
    }
    if (!path) {
      console.error('SKIP page without path');
      continue;
    }
    write(`pages/${fileStemFromPath(path)}.md`, {
      path,
      title: page.title,
      metadata: page.metadata ?? {},
      body: page.content ?? '',
    });
  }

  write('pages/home.md', {
    path: '/',
    title: 'Каталог деловых мероприятий',
    metadata: {
      title: 'Деловые мероприятия — каталог конференций и выставок | Workevent',
      h1: 'Деловые мероприятия',
      description: 'Каталог деловых мероприятий: конференции, форумы и выставки по датам, городам и отраслям.',
      robots: 'index,follow',
    },
    body: '',
  });

  const postsSeed = JSON.parse(readFileSync(resolve(root, 'seo/posts-seed.json'), 'utf8'));
  let i = 0;
  for (const post of postsSeed.posts ?? []) {
    i += 1;
    write(`posts/new-${i}.md`, {
      title: post.title,
      metadata: {},
      body: post.content ?? '',
    });
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
```

Посты из сида без `id`. После `content:pull` живые посты перезапишут `posts/{id}.md`. Файлы `posts/new-*.md` не apply-ить, пока не сверите title с живыми — иначе создадите дубли. Если pull уже забрал тот же title, `new-*.md` удалить.

- [ ] **Step 2: Run import**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && node scripts/content/import-from-seed.mjs`

Expected: файлы в `content/pages` и `content/posts`.

- [ ] **Step 3: Prefer live copy when token already exists**

Если Task 6 сделан:

```bash
npm run content:pull
```

Pull перезаписывает импорт живыми данными. Это правильный порядок: seed — черновик, БД — живое.

- [ ] **Step 4: Lint and list hits**

Run: `npm run content:lint`

Expected: либо ok, либо список хитов. Хиты не публиковать. Переписать файлы с `страница собрана` / `не под общий обзор` до первого apply.

- [ ] **Step 5: Commit content files that lint accepts, plus the importer**

Не коммитить файлы, которые линтер ещё валит, если их можно сначала переписать в этом же шаге. Если хитов много — закоммитить importer + чистые файлы (home и то, что прошло lint), остальные дописать отдельным commit после правки.

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
git add scripts/content/import-from-seed.mjs content
git commit -m "$(cat <<'EOF'
feat: add content working copies from seed and live pages

EOF
)"
```

---

### Task 12: Docs, cursor rules, deprecate Dokploy seeders

**Files:**
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/seo/README.md`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/.cursor/rules/seo-backend-seed.mdc`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/seed-seo-pages.php` (шапка)
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/seed-seo-posts.php` (шапка)
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/dokploy-seed-posts.mjs` (шапка)
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/scripts/generate-pages-seed.mjs` (шапка)
- Repo: `workevent-front`

- [ ] **Step 1: Replace seo/README.md command section**

Заменить абзац про seed-скрипт как штатный путь на:

```md
Штатный путь: файлы в `content/` → `npm run content:lint` → `npm run content:apply -- --dry-run --only=path:/city/moskva-1` → `npm run content:apply -- --only=path:/city/moskva-1`.

Запись идёт в Filament admin API (`/api/admin/pages`, `/api/admin/posts`) с токеном из `.env.local` (`ADMIN_API_URL`, `ADMIN_API_TOKEN`). Публичный `POST /api/v1/posts` по-прежнему 405.

После ручных правок в Filament: `npm run content:pull`.

Dokploy-сидеры `scripts/seed-seo-*.php` и `npm run seo:seed-posts` — deprecated, запасной путь на один переход.
```

Оставить линт-правило и ссылку на `.cursor/rules/seo-content-lint.mdc`.

- [ ] **Step 2: Update seo-backend-seed.mdc**

```md
---
description: Контент pages/posts писать в Laravel через Filament admin API, не во фронт и не через POST /v1/posts
globs: content/**/*,seo/**/*,scripts/content/**,scripts/seed-seo*.php,scripts/dokploy-*.mjs,scripts/lint-seo-content.mjs
alwaysApply: true
---

# Контент: Laravel через Filament API

Посадочные (`pages`) и статьи (`posts`) живут в Laravel. Не хардкодить тексты во фронте. Не вызывать `POST /api/v1/posts` — 405.

## Команды

```bash
npm run content:pull
npm run content:lint
npm run content:apply -- --dry-run --only=path:/
npm run content:apply -- --only=path:/
```

Токен: Filament → Tokens → `.env.local` (`ADMIN_API_TOKEN`). В чат не писать.

## Что куда

| Сущность | Модель | Файл | Запись |
| --- | --- | --- | --- |
| Посадочные | `Page` + metadata | `content/pages/*.md` | `PUT/POST /api/admin/pages` |
| Статьи | `Post` | `content/posts/{id}.md` | `PUT/POST /api/admin/posts` |

Ключ страницы — `path`. Ключ поста — `id`. Обложку не заливать через API.

Перед apply — `npm run content:lint`. Старые `seo:seed-posts` / `seed-seo-*.php` не использовать в новых задачах.
```

- [ ] **Step 3: Mark old scripts deprecated**

В шапку `seed-seo-pages.php`, `seed-seo-posts.php`, `dokploy-seed-posts.mjs` и `generate-pages-seed.mjs` первой строкой блока комментария:

```
@deprecated Use content/*.md and npm run content:apply. This script is a fallback only.
```

У `generate-pages-seed.mjs` добавить: выход генератора — черновик, не публикация. Если будете менять генератор позже, писать в `content/`, не в apply.

- [ ] **Step 4: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
git add seo/README.md .cursor/rules/seo-backend-seed.mdc scripts/seed-seo-pages.php scripts/seed-seo-posts.php scripts/dokploy-seed-posts.mjs scripts/generate-pages-seed.mjs
git commit -m "$(cat <<'EOF'
docs: switch content workflow to Filament admin API

EOF
)"
```

---

## Self-review

| Spec requirement | Task |
| --- | --- |
| `rupadana/filament-api-service`, `/api/admin/pages\|posts` | 3 |
| Sanctum `HasApiTokens`, token в `.env.local` | 3, 6, 10 |
| `enable_policy=false`, без Shield | 3 |
| Публичный `/v1` только GET, POST posts 405 | 1 |
| Metadata hook + транзакция, поля title/h1/description/keywords/robots/canonical_url | 4 |
| `filter[path]` | 4 |
| Посты по `id`, без cover API | 3, 8 |
| `content/*` Markdown | 7, 11 |
| Команды `content:pull\|lint\|apply` | 10 |
| `--only`, `--dry-run`, только отличия | 8, 9 |
| 401 стоп, lint блокирует HTTP, 422 продолжает, page 404→POST, post 404→FAIL | 9 |
| Pull перезаписывает | 10 |
| Import seed + home `/` | 11 |
| Deprecated Dokploy seeders | 12 |
| Тесты бэка и фронта, прод не в CI | 1–5, 7–9 |
| RoutesTest не ломается | 5 |
| Токен не логировать | 9 |

Нет TBD. Имена `planActions`, `metadataToApi`, `loadAdminEnv`, `ADMIN_API_URL` согласованы между задачами 7–10.
