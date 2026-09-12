# Event submissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Публичная форма `/events/new` пишет заявку в Laravel, показывает её в Filament и ставит в очередь письмо на `dzorogh@gmail.com`; без валидного hCaptcha строка не создаётся.

**Architecture:** Первый публичный `POST /api/v1/event-submissions`. Сначала валидация полей, затем синхронный `siteverify` (form-urlencoded: secret, response, remoteip, sitekey), затем INSERT, затем queued mailable. Капчу в очередь не ставить. Ошибка SMTP не роняет `201`.

**Tech Stack:** Laravel 12, Filament 4, PHPUnit 11, `Http::fake`, `Mail::fake`, Next.js 16, `@hcaptcha/react-hcaptcha`, openapi-fetch.

**Spec:** `docs/superpowers/specs/2026-09-12-event-submissions-design.md`

**Репозитории:** задачи 1–4 — `/Users/dzorogh/Develop/workevent/workevent-back`. Задача 5 — `/Users/dzorogh/Develop/workevent/workevent-front`. Секреты не коммитить и не писать в чат.

## Global Constraints

- Получатель письма: `dzorogh@gmail.com`. Отправителю ничего.
- Статусы только `new` / `processed`. В `Event` не конвертируем.
- API-поля snake_case. Токен капчи в теле: `h-captcha-response`.
- siteverify: POST `application/x-www-form-urlencoded` на `https://api.hcaptcha.com/siteverify`, не JSON и не GET.
- Hostname allowlist: `workevent.ru`, `www.workevent.ru`, `localhost`, `127.0.0.1`.
- Лимит: 5 запросов в минуту с IP.
- Debug в БД: `ip`, `user_agent`, `referer`, `hcaptcha_hostname`, `hcaptcha_challenge_ts`. Токен и secret не хранить.
- Ответ успеха: `201` и `{ "data": { "id": … } }`. Debug клиенту не отдавать.
- `localStorage` заявок убрать.
- Живой siteverify и реальный SMTP в CI не вызывать.
- После прод-проверки тестовую заявку удалить в той же сессии.

---

## File map

### workevent-back

| File | Role |
| --- | --- |
| `database/migrations/2026_09_12_000000_create_event_submissions_table.php` | таблица |
| `app/Enums/EventSubmissionStatus.php` | `new` / `processed` |
| `app/Models/EventSubmission.php` | модель + `industry()` |
| `config/hcaptcha.php` | secret, sitekey, url, hostnames |
| `config/services.php` | `event_submissions.notify_email` |
| `app/Services/HCaptcha/HCaptchaVerification.php` | результат проверки |
| `app/Services/HCaptcha/HCaptchaVerifier.php` | вызов siteverify |
| `app/Http/Requests/Api/V1/StoreEventSubmissionRequest.php` | правила полей + токен |
| `app/Http/Controllers/Api/V1/EventSubmissionController.php` | verify → insert → queue mail |
| `app/Http/Resources/EventSubmissionCreatedResource.php` | `{ id }` |
| `app/Mail/EventSubmissionReceived.php` | queued mailable |
| `resources/views/mail/event-submission-received.blade.php` | тело письма |
| `routes/api.php` | `POST event-submissions` + `throttle:5,1` |
| `app/Filament/Resources/EventSubmissions/*` | список и просмотр |
| `lang/ru/filament-resources.php` | подписи «Заявки» |
| `.env.example`, `phpunit.xml` | ключи без секретов |
| `tests/Unit/HCaptchaVerifierTest.php` | мок HTTP |
| `tests/Feature/EventSubmissionApiTest.php` | публичный POST |
| `tests/Feature/EventSubmissionResourceTest.php` | Filament canCreate/pages |

### workevent-front

| File | Role |
| --- | --- |
| `src/lib/api/v1.d.ts` | ручной `POST /v1/event-submissions` до `generate-api` |
| `src/config/env.ts` | `hcaptchaSiteKey` |
| `.env.example` | `NEXT_PUBLIC_HCAPTCHA_SITEKEY` |
| `src/app/events/new/new-event-form.tsx` | POST + виджет |
| `src/app/events/new/page.tsx` | копирайт без localStorage |
| `src/lib/event-submissions.ts` | удалить |
| `package.json` | `@hcaptcha/react-hcaptcha` |

---

### Task 1: Таблица и модель заявки

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/database/migrations/2026_09_12_000000_create_event_submissions_table.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Enums/EventSubmissionStatus.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Models/EventSubmission.php`
- Test: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Feature/EventSubmissionApiTest.php` (пока один тест модели; остальные тесты — в Task 3)
- Repo: `workevent-back`

**Interfaces:**
- Consumes: `Industry` (`id`, `title`)
- Produces: `EventSubmissionStatus` (`New = 'new'`, `Processed = 'processed'`); модель `EventSubmission` с fillable/casts как ниже; `industry(): BelongsTo`

- [ ] **Step 1: Write the failing test**

В `tests/Feature/EventSubmissionApiTest.php` пока только этот метод (класс расширим в Task 3):

```php
<?php

namespace Tests\Feature;

use App\Enums\EventSubmissionStatus;
use App\Models\EventSubmission;
use App\Models\Industry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventSubmissionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_submission_can_be_persisted_with_debug_fields(): void
    {
        $industry = Industry::query()->create([
            'title' => 'IT',
        ]);

        $submission = EventSubmission::query()->create([
            'title' => 'CEMAT RUSSIA',
            'date_from' => '2026-09-23',
            'date_to' => '2026-09-25',
            'city' => 'Москва',
            'industry_id' => $industry->id,
            'contact' => 'hello@example.com',
            'comment' => 'Стенд',
            'status' => EventSubmissionStatus::New,
            'ip' => '203.0.113.10',
            'user_agent' => 'PHPUnit',
            'referer' => 'http://localhost:3000/events/new',
            'hcaptcha_hostname' => 'localhost',
            'hcaptcha_challenge_ts' => '2026-09-12T12:00:00Z',
        ]);

        $this->assertDatabaseHas('event_submissions', [
            'id' => $submission->id,
            'title' => 'CEMAT RUSSIA',
            'status' => 'new',
            'ip' => '203.0.113.10',
            'industry_id' => $industry->id,
        ]);
        $this->assertSame('IT', $submission->industry->title);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=test_submission_can_be_persisted_with_debug_fields`

Expected: FAIL — нет класса `EventSubmission` или нет таблицы.

- [ ] **Step 3: Write minimal implementation**

`app/Enums/EventSubmissionStatus.php`:

```php
<?php

namespace App\Enums;

enum EventSubmissionStatus: string
{
    case New = 'new';
    case Processed = 'processed';
}
```

`database/migrations/2026_09_12_000000_create_event_submissions_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('date_from');
            $table->date('date_to')->nullable();
            $table->string('city');
            $table->foreignId('industry_id')->nullable()->constrained()->nullOnDelete();
            $table->string('contact');
            $table->text('comment')->nullable();
            $table->string('status')->default('new')->index();
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('referer')->nullable();
            $table->string('hcaptcha_hostname')->nullable();
            $table->string('hcaptcha_challenge_ts')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_submissions');
    }
};
```

`app/Models/EventSubmission.php`:

```php
<?php

namespace App\Models;

use App\Enums\EventSubmissionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSubmission extends Model
{
    protected $fillable = [
        'title',
        'date_from',
        'date_to',
        'city',
        'industry_id',
        'contact',
        'comment',
        'status',
        'ip',
        'user_agent',
        'referer',
        'hcaptcha_hostname',
        'hcaptcha_challenge_ts',
    ];

    protected function casts(): array
    {
        return [
            'date_from' => 'date',
            'date_to' => 'date',
            'status' => EventSubmissionStatus::class,
        ];
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=test_submission_can_be_persisted_with_debug_fields`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add database/migrations/2026_09_12_000000_create_event_submissions_table.php app/Enums/EventSubmissionStatus.php app/Models/EventSubmission.php tests/Feature/EventSubmissionApiTest.php
git commit -m "$(cat <<'EOF'
Чтобы заявки жили в админке, заводим таблицу event_submissions.

EOF
)"
```

---

### Task 2: Проверка hCaptcha на бэке

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/config/hcaptcha.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Services/HCaptcha/HCaptchaVerification.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Services/HCaptcha/HCaptchaVerifier.php`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/.env.example` — добавить ключи в конце
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/phpunit.xml` — тестовые ключи
- Test: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Unit/HCaptchaVerifierTest.php`
- Repo: `workevent-back`

**Interfaces:**
- Consumes: `config('hcaptcha.secret')`, `config('hcaptcha.sitekey')`, `config('hcaptcha.verify_url')`, `config('hcaptcha.allowed_hostnames')`
- Produces: `HCaptchaVerifier::verify(string $token, ?string $remoteIp): HCaptchaVerification`; `HCaptchaVerification` с полями `bool $success`, `bool $unavailable`, `?string $hostname`, `?string $challengeTs`, `array $errorCodes`

- [ ] **Step 1: Write the failing test**

`tests/Unit/HCaptchaVerifierTest.php`:

```php
<?php

namespace Tests\Unit;

use App\Services\HCaptcha\HCaptchaVerifier;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HCaptchaVerifierTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config([
            'hcaptcha.secret' => 'test-secret',
            'hcaptcha.sitekey' => 'test-sitekey',
            'hcaptcha.verify_url' => 'https://api.hcaptcha.com/siteverify',
            'hcaptcha.allowed_hostnames' => ['workevent.ru', 'www.workevent.ru', 'localhost', '127.0.0.1'],
        ]);
    }

    public function test_success_with_allowed_hostname(): void
    {
        Http::fake([
            'https://api.hcaptcha.com/siteverify' => Http::response([
                'success' => true,
                'hostname' => 'localhost',
                'challenge_ts' => '2026-09-12T12:00:00Z',
            ], 200),
        ]);

        $result = app(HCaptchaVerifier::class)->verify('token-1', '203.0.113.10');

        $this->assertTrue($result->success);
        $this->assertFalse($result->unavailable);
        $this->assertSame('localhost', $result->hostname);
        $this->assertSame('2026-09-12T12:00:00Z', $result->challengeTs);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.hcaptcha.com/siteverify'
                && $request->hasHeader('Content-Type', 'application/x-www-form-urlencoded')
                && $request['secret'] === 'test-secret'
                && $request['response'] === 'token-1'
                && $request['remoteip'] === '203.0.113.10'
                && $request['sitekey'] === 'test-sitekey';
        });
    }

    public function test_rejects_disallowed_hostname(): void
    {
        Http::fake([
            'https://api.hcaptcha.com/siteverify' => Http::response([
                'success' => true,
                'hostname' => 'evil.example',
                'challenge_ts' => '2026-09-12T12:00:00Z',
            ], 200),
        ]);

        $result = app(HCaptchaVerifier::class)->verify('token-1', '203.0.113.10');

        $this->assertFalse($result->success);
        $this->assertFalse($result->unavailable);
        $this->assertSame(['hostname-mismatch'], $result->errorCodes);
    }

    public function test_failed_token_is_not_success(): void
    {
        Http::fake([
            'https://api.hcaptcha.com/siteverify' => Http::response([
                'success' => false,
                'error-codes' => ['invalid-or-already-seen-response'],
            ], 200),
        ]);

        $result = app(HCaptchaVerifier::class)->verify('token-1', '203.0.113.10');

        $this->assertFalse($result->success);
        $this->assertFalse($result->unavailable);
        $this->assertSame(['invalid-or-already-seen-response'], $result->errorCodes);
    }

    public function test_siteverify_5xx_is_unavailable(): void
    {
        Http::fake([
            'https://api.hcaptcha.com/siteverify' => Http::response('down', 503),
        ]);

        $result = app(HCaptchaVerifier::class)->verify('token-1', '203.0.113.10');

        $this->assertFalse($result->success);
        $this->assertTrue($result->unavailable);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=HCaptchaVerifierTest`

Expected: FAIL — нет `HCaptchaVerifier`.

- [ ] **Step 3: Write minimal implementation**

`config/hcaptcha.php`:

```php
<?php

return [
    'secret' => env('HCAPTCHA_SECRET'),
    'sitekey' => env('HCAPTCHA_SITEKEY'),
    'verify_url' => 'https://api.hcaptcha.com/siteverify',
    'allowed_hostnames' => ['workevent.ru', 'www.workevent.ru', 'localhost', '127.0.0.1'],
];
```

`app/Services/HCaptcha/HCaptchaVerification.php`:

```php
<?php

namespace App\Services\HCaptcha;

final readonly class HCaptchaVerification
{
    /**
     * @param  list<string>  $errorCodes
     */
    public function __construct(
        public bool $success,
        public bool $unavailable,
        public ?string $hostname,
        public ?string $challengeTs,
        public array $errorCodes,
    ) {}
}
```

`app/Services/HCaptcha/HCaptchaVerifier.php`:

```php
<?php

namespace App\Services\HCaptcha;

use Illuminate\Support\Facades\Http;
use Throwable;

class HCaptchaVerifier
{
    public function verify(string $token, ?string $remoteIp): HCaptchaVerification
    {
        try {
            $response = Http::asForm()
                ->timeout(8)
                ->post(config('hcaptcha.verify_url'), [
                    'secret' => config('hcaptcha.secret'),
                    'response' => $token,
                    'remoteip' => $remoteIp,
                    'sitekey' => config('hcaptcha.sitekey'),
                ]);
        } catch (Throwable) {
            return new HCaptchaVerification(false, true, null, null, ['siteverify-unavailable']);
        }

        if (! $response->successful()) {
            return new HCaptchaVerification(false, true, null, null, ['siteverify-unavailable']);
        }

        $payload = $response->json() ?? [];
        $hostname = $payload['hostname'] ?? null;
        $allowed = config('hcaptcha.allowed_hostnames');

        if (($payload['success'] ?? false) !== true) {
            return new HCaptchaVerification(
                success: false,
                unavailable: false,
                hostname: is_string($hostname) ? $hostname : null,
                challengeTs: $payload['challenge_ts'] ?? null,
                errorCodes: $payload['error-codes'] ?? [],
            );
        }

        if (! is_string($hostname) || ! in_array($hostname, $allowed, true)) {
            return new HCaptchaVerification(false, false, is_string($hostname) ? $hostname : null, $payload['challenge_ts'] ?? null, ['hostname-mismatch']);
        }

        return new HCaptchaVerification(
            success: true,
            unavailable: false,
            hostname: $hostname,
            challengeTs: $payload['challenge_ts'] ?? null,
            errorCodes: [],
        );
    }
}
```

В конец `.env.example` (значения тестовых ключей публичные, secret прода не писать):

```
HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
HCAPTCHA_SECRET=0x0000000000000000000000000000000000000000
EVENT_SUBMISSION_NOTIFY_EMAIL=dzorogh@gmail.com
```

В `phpunit.xml` внутри `<php>`:

```xml
<env name="HCAPTCHA_SITEKEY" value="10000000-ffff-ffff-ffff-000000000001"/>
<env name="HCAPTCHA_SECRET" value="0x0000000000000000000000000000000000000000"/>
<env name="EVENT_SUBMISSION_NOTIFY_EMAIL" value="dzorogh@gmail.com"/>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=HCaptchaVerifierTest`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add config/hcaptcha.php app/Services/HCaptcha/HCaptchaVerification.php app/Services/HCaptcha/HCaptchaVerifier.php tests/Unit/HCaptchaVerifierTest.php .env.example phpunit.xml
git commit -m "$(cat <<'EOF'
Проверяем hCaptcha на бэке через siteverify, не доверяя токену с клиента.

EOF
)"
```

---

### Task 3: Публичный POST, письмо, лимит

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Http/Requests/Api/V1/StoreEventSubmissionRequest.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Http/Controllers/Api/V1/EventSubmissionController.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Http/Resources/EventSubmissionCreatedResource.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Mail/EventSubmissionReceived.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/resources/views/mail/event-submission-received.blade.php`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/config/services.php` — блок `event_submissions`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/routes/api.php`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Feature/EventSubmissionApiTest.php`
- Repo: `workevent-back`

**Interfaces:**
- Consumes: `HCaptchaVerifier::verify()`, `EventSubmission`, `EventSubmissionStatus::New`
- Produces: `POST /api/v1/event-submissions` → 201 `{ data: { id } }` / 422 / 429 / 503; `EventSubmissionReceived` implements `ShouldQueue`; получатель `config('services.event_submissions.notify_email')`

- [ ] **Step 1: Write the failing tests**

Дописать в `EventSubmissionApiTest` (класс и `RefreshDatabase` уже есть). Добавить импорты: `EventSubmissionReceived`, `Http`, `Mail`, `RateLimiter`. Хелперы в том же классе:

```php
use App\Mail\EventSubmissionReceived;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

private function validPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'CEMAT RUSSIA',
        'date_from' => '2026-09-23',
        'date_to' => '2026-09-25',
        'city' => 'Москва',
        'contact' => 'hello@example.com',
        'comment' => 'Стенд',
        'h-captcha-response' => 'test-token',
    ], $overrides);
}

private function fakeSuccessfulCaptcha(): void
{
    Http::fake([
        'https://api.hcaptcha.com/siteverify' => Http::response([
            'success' => true,
            'hostname' => 'localhost',
            'challenge_ts' => '2026-09-12T12:00:00Z',
        ], 200),
    ]);
}
```

Тесты:

```php
public function test_valid_submission_is_stored_and_mail_is_queued(): void
{
    Mail::fake();
    $this->fakeSuccessfulCaptcha();

    $industry = Industry::query()->create(['title' => 'IT']);

    $response = $this->withHeaders([
        'User-Agent' => 'PHPUnit-Agent',
        'Referer' => 'http://localhost:3000/events/new',
    ])->postJson('/api/v1/event-submissions', $this->validPayload([
        'industry_id' => $industry->id,
    ]));

    $response->assertCreated()
        ->assertJsonStructure(['data' => ['id']])
        ->assertJsonMissing(['ip', 'user_agent', 'hcaptcha_hostname']);

    $id = $response->json('data.id');
    $this->assertDatabaseHas('event_submissions', [
        'id' => $id,
        'title' => 'CEMAT RUSSIA',
        'status' => 'new',
        'industry_id' => $industry->id,
        'hcaptcha_hostname' => 'localhost',
        'user_agent' => 'PHPUnit-Agent',
        'referer' => 'http://localhost:3000/events/new',
    ]);

    Mail::assertQueued(EventSubmissionReceived::class, function (EventSubmissionReceived $mail) {
        return $mail->hasTo('dzorogh@gmail.com');
    });
}

public function test_invalid_fields_do_not_call_siteverify(): void
{
    Http::fake();

    $this->postJson('/api/v1/event-submissions', [
        'h-captcha-response' => 'test-token',
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'date_from', 'city', 'contact']);

    Http::assertNothingSent();
    $this->assertDatabaseCount('event_submissions', 0);
}

public function test_failed_captcha_does_not_persist_or_mail(): void
{
    Mail::fake();
    Http::fake([
        'https://api.hcaptcha.com/siteverify' => Http::response([
            'success' => false,
            'error-codes' => ['invalid-or-already-seen-response'],
        ], 200),
    ]);

    $this->postJson('/api/v1/event-submissions', $this->validPayload())
        ->assertStatus(422)
        ->assertJsonValidationErrors(['h-captcha-response']);

    $this->assertDatabaseCount('event_submissions', 0);
    Mail::assertNothingQueued();
}

public function test_siteverify_outage_returns_503(): void
{
    Mail::fake();
    Http::fake([
        'https://api.hcaptcha.com/siteverify' => Http::response('down', 503),
    ]);

    $this->postJson('/api/v1/event-submissions', $this->validPayload())
        ->assertStatus(503);

    $this->assertDatabaseCount('event_submissions', 0);
    Mail::assertNothingQueued();
}

public function test_sixth_request_from_same_ip_is_throttled(): void
{
    Mail::fake();
    $this->fakeSuccessfulCaptcha();
    RateLimiter::clear('event-submissions');

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/event-submissions', $this->validPayload([
            'title' => "Event {$i}",
        ]))->assertCreated();
    }

    $this->postJson('/api/v1/event-submissions', $this->validPayload([
        'title' => 'Event 5',
    ]))->assertStatus(429);
}
```

Если `RateLimiter::clear('event-submissions')` не снимет throttle Laravel, в тесте после реализации использовать тот же ключ, что в `RateLimiter::for` (Step 3). Пока достаточно `assertStatus(429)` на 6-м запросе с одного IP.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=EventSubmissionApiTest`

Expected: FAIL на новых тестах — маршрута нет. Тест Task 1 остаётся зелёным.

- [ ] **Step 3: Write minimal implementation**

В `config/services.php` рядом с другими сервисами:

```php
'event_submissions' => [
    'notify_email' => env('EVENT_SUBMISSION_NOTIFY_EMAIL', 'dzorogh@gmail.com'),
],
```

`app/Http/Requests/Api/V1/StoreEventSubmissionRequest.php`:

```php
<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreEventSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'city' => ['required', 'string', 'max:255'],
            'industry_id' => ['nullable', 'integer', 'exists:industries,id'],
            'contact' => ['required', 'string', 'max:255'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'h-captcha-response' => ['required', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $contact = trim((string) $this->input('contact'));
            if ($contact === '') {
                return;
            }

            $ok = str_contains($contact, '@')
                || preg_match('#^https?://#i', $contact)
                || str_contains($contact, '.');

            if (! $ok) {
                $validator->errors()->add('contact', 'Укажите сайт или email');
            }
        });
    }
}
```

`app/Http/Resources/EventSubmissionCreatedResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventSubmissionCreatedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
        ];
    }
}
```

`app/Mail/EventSubmissionReceived.php`:

```php
<?php

namespace App\Mail;

use App\Models\EventSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventSubmissionReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public EventSubmission $submission,
        public string $adminUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Новая заявка: '.$this->submission->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.event-submission-received',
        );
    }
}
```

`resources/views/mail/event-submission-received.blade.php`:

```blade
<x-mail::message>
# Новая заявка: {{ $submission->title }}

- Даты: {{ $submission->date_from?->format('Y-m-d') }}{{ $submission->date_to ? ' — '.$submission->date_to->format('Y-m-d') : '' }}
- Город: {{ $submission->city }}
- Отрасль: {{ $submission->industry?->title ?? '—' }}
- Контакт: {{ $submission->contact }}
- Комментарий: {{ $submission->comment ?: '—' }}
- Статус: {{ $submission->status->value }}
- ID: {{ $submission->id }}
- IP: {{ $submission->ip ?: '—' }}
- User-Agent: {{ $submission->user_agent ?: '—' }}
- Referer: {{ $submission->referer ?: '—' }}
- hCaptcha host: {{ $submission->hcaptcha_hostname ?: '—' }}
- hCaptcha ts: {{ $submission->hcaptcha_challenge_ts ?: '—' }}

<x-mail::button :url="$adminUrl">
Открыть в Filament
</x-mail::button>
</x-mail::message>
```

`app/Http/Controllers/Api/V1/EventSubmissionController.php`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EventSubmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreEventSubmissionRequest;
use App\Http\Resources\EventSubmissionCreatedResource;
use App\Mail\EventSubmissionReceived;
use App\Models\EventSubmission;
use App\Services\HCaptcha\HCaptchaVerifier;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class EventSubmissionController extends Controller
{
    public function store(StoreEventSubmissionRequest $request, HCaptchaVerifier $verifier)
    {
        $verification = $verifier->verify(
            $request->validated('h-captcha-response'),
            $request->ip(),
        );

        if ($verification->unavailable) {
            return response()->json([
                'message' => 'Проверка временно недоступна. Попробуйте позже',
            ], 503);
        }

        if (! $verification->success) {
            return response()->json([
                'message' => 'Пройдите проверку ещё раз',
                'errors' => [
                    'h-captcha-response' => ['Пройдите проверку ещё раз'],
                ],
            ], 422);
        }

        $submission = EventSubmission::query()->create([
            'title' => $request->validated('title'),
            'date_from' => $request->validated('date_from'),
            'date_to' => $request->validated('date_to'),
            'city' => $request->validated('city'),
            'industry_id' => $request->validated('industry_id'),
            'contact' => $request->validated('contact'),
            'comment' => $request->validated('comment'),
            'status' => EventSubmissionStatus::New,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->headers->get('referer'),
            'hcaptcha_hostname' => $verification->hostname,
            'hcaptcha_challenge_ts' => $verification->challengeTs,
        ]);

        try {
            Mail::to(config('services.event_submissions.notify_email'))
                ->queue(new EventSubmissionReceived(
                    $submission->load('industry'),
                    url('/event-submissions/'.$submission->id),
                ));
        } catch (Throwable $e) {
            Log::error('event_submission_mail_failed', [
                'id' => $submission->id,
                'error' => $e->getMessage(),
            ]);
        }

        return (new EventSubmissionCreatedResource($submission))
            ->response()
            ->setStatusCode(201);
    }
}
```

В `routes/api.php` внутри группы `v1`:

```php
use App\Http\Controllers\Api\V1\EventSubmissionController;

Route::post('event-submissions', [EventSubmissionController::class, 'store'])
    ->middleware('throttle:5,1');
```

Scramble подхватит маршрут из PHPDoc контроллера. Над `store` добавить:

```php
/**
 * Create event submission
 *
 * @response 201 array{data: array{id: int}}
 */
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=EventSubmissionApiTest`

Expected: PASS все методы, включая persist из Task 1.

Если throttle не срабатывает из-за другого имени лимитера — не менять лимит 5/мин, поправить только ключ `RateLimiter::clear` в тесте.

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add app/Http/Requests/Api/V1/StoreEventSubmissionRequest.php app/Http/Controllers/Api/V1/EventSubmissionController.php app/Http/Resources/EventSubmissionCreatedResource.php app/Mail/EventSubmissionReceived.php resources/views/mail/event-submission-received.blade.php config/services.php routes/api.php tests/Feature/EventSubmissionApiTest.php
git commit -m "$(cat <<'EOF'
Принимаем заявки на событие через публичный POST и ставим письмо в очередь.

EOF
)"
```

---

### Task 4: Filament «Заявки»

**Files:**
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Filament/Resources/EventSubmissions/EventSubmissionResource.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Filament/Resources/EventSubmissions/Pages/ListEventSubmissions.php`
- Create: `/Users/dzorogh/Develop/workevent/workevent-back/app/Filament/Resources/EventSubmissions/Pages/ViewEventSubmission.php`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-back/lang/ru/filament-resources.php` — ключ `event-submissions` перед `'users'`
- Test: `/Users/dzorogh/Develop/workevent/workevent-back/tests/Feature/EventSubmissionResourceTest.php`
- Repo: `workevent-back`

**Interfaces:**
- Consumes: `EventSubmission`, `EventSubmissionStatus`
- Produces: страницы `index` → `/event-submissions`, `view` → `/event-submissions/{record}`; `canCreate(): false`; действия `markProcessed` / `markNew`; сортировка `created_at desc`

- [ ] **Step 1: Write the failing test**

`tests/Feature/EventSubmissionResourceTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Filament\Resources\EventSubmissions\EventSubmissionResource;
use App\Filament\Resources\EventSubmissions\Pages\ListEventSubmissions;
use App\Filament\Resources\EventSubmissions\Pages\ViewEventSubmission;
use App\Models\EventSubmission;
use Tests\TestCase;

class EventSubmissionResourceTest extends TestCase
{
    public function test_resource_is_read_only_create(): void
    {
        $this->assertSame(EventSubmission::class, EventSubmissionResource::getModel());
        $this->assertFalse(EventSubmissionResource::canCreate());
        $this->assertSame(ListEventSubmissions::class, EventSubmissionResource::getPages()['index']->getPage());
        $this->assertSame(ViewEventSubmission::class, EventSubmissionResource::getPages()['view']->getPage());
    }
}
```

Если `getPages()['index']->getPage()` в Filament 4 называется иначе — после первого падения поправить тест на фактический API (`->getPageClass()` / сравнение `route`), не меняя смысл: create нет, view есть.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=EventSubmissionResourceTest`

Expected: FAIL — нет `EventSubmissionResource`.

- [ ] **Step 3: Write minimal implementation**

В `lang/ru/filament-resources.php` перед `'users' => [`:

```php
    'event-submissions' => [
        'label' => 'Заявка',
        'plural_label' => 'Заявки',
        'fields' => [
            'title' => 'Название',
            'date_from' => 'Дата начала',
            'date_to' => 'Дата окончания',
            'city' => 'Город',
            'industry_id' => 'Отрасль',
            'contact' => 'Контакт',
            'comment' => 'Комментарий',
            'status' => 'Статус',
            'ip' => 'IP',
            'user_agent' => 'User-Agent',
            'referer' => 'Referer',
            'hcaptcha_hostname' => 'hCaptcha host',
            'hcaptcha_challenge_ts' => 'hCaptcha ts',
            'created_at' => 'Создана',
        ],
        'statuses' => [
            'new' => 'Новая',
            'processed' => 'Обработана',
        ],
        'actions' => [
            'mark_processed' => 'Обработана',
            'mark_new' => 'Вернуть в новые',
        ],
    ],
```

`app/Filament/Resources/EventSubmissions/EventSubmissionResource.php` — по образцу `TagResource` (Filament 4 `Schema`, `Table`, `discoverResources` уже включён):

```php
<?php

namespace App\Filament\Resources\EventSubmissions;

use App\Enums\EventSubmissionStatus;
use App\Filament\Resources\EventSubmissions\Pages\ListEventSubmissions;
use App\Filament\Resources\EventSubmissions\Pages\ViewEventSubmission;
use App\Models\EventSubmission;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class EventSubmissionResource extends Resource
{
    protected static ?string $model = EventSubmission::class;

    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-inbox';

    protected static string | \UnitEnum | null $navigationGroup = 'events';

    protected static ?int $navigationSort = 20;

    public static function getModelLabel(): string
    {
        return __('filament-resources.event-submissions.label');
    }

    public static function getPluralModelLabel(): string
    {
        return __('filament-resources.event-submissions.plural_label');
    }

    public static function canCreate(): bool
    {
        return false;
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->schema([
                TextEntry::make('title')->label(__('filament-resources.event-submissions.fields.title')),
                TextEntry::make('date_from')->date()->label(__('filament-resources.event-submissions.fields.date_from')),
                TextEntry::make('date_to')->date()->label(__('filament-resources.event-submissions.fields.date_to')),
                TextEntry::make('city')->label(__('filament-resources.event-submissions.fields.city')),
                TextEntry::make('industry.title')->label(__('filament-resources.event-submissions.fields.industry_id')),
                TextEntry::make('contact')->label(__('filament-resources.event-submissions.fields.contact')),
                TextEntry::make('comment')->label(__('filament-resources.event-submissions.fields.comment')),
                TextEntry::make('status')->label(__('filament-resources.event-submissions.fields.status'))
                    ->formatStateUsing(fn (EventSubmissionStatus $state): string => __('filament-resources.event-submissions.statuses.'.$state->value)),
                TextEntry::make('ip')->label(__('filament-resources.event-submissions.fields.ip')),
                TextEntry::make('user_agent')->label(__('filament-resources.event-submissions.fields.user_agent')),
                TextEntry::make('referer')->label(__('filament-resources.event-submissions.fields.referer')),
                TextEntry::make('hcaptcha_hostname')->label(__('filament-resources.event-submissions.fields.hcaptcha_hostname')),
                TextEntry::make('hcaptcha_challenge_ts')->label(__('filament-resources.event-submissions.fields.hcaptcha_challenge_ts')),
                TextEntry::make('created_at')->dateTime()->label(__('filament-resources.event-submissions.fields.created_at')),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('title')->searchable()->label(__('filament-resources.event-submissions.fields.title')),
                TextColumn::make('city')->label(__('filament-resources.event-submissions.fields.city')),
                TextColumn::make('date_from')->date()->label(__('filament-resources.event-submissions.fields.date_from')),
                TextColumn::make('date_to')->date()->label(__('filament-resources.event-submissions.fields.date_to')),
                TextColumn::make('contact')->label(__('filament-resources.event-submissions.fields.contact')),
                TextColumn::make('status')->badge()->label(__('filament-resources.event-submissions.fields.status'))
                    ->formatStateUsing(fn (EventSubmissionStatus $state): string => __('filament-resources.event-submissions.statuses.'.$state->value)),
                TextColumn::make('created_at')->dateTime()->sortable()->label(__('filament-resources.event-submissions.fields.created_at')),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        EventSubmissionStatus::New->value => __('filament-resources.event-submissions.statuses.new'),
                        EventSubmissionStatus::Processed->value => __('filament-resources.event-submissions.statuses.processed'),
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),
                self::markProcessedAction(),
                self::markNewAction(),
                DeleteAction::make(),
            ]);
    }

    public static function markProcessedAction(): Action
    {
        return Action::make('markProcessed')
            ->label(__('filament-resources.event-submissions.actions.mark_processed'))
            ->visible(fn (EventSubmission $record): bool => $record->status === EventSubmissionStatus::New)
            ->action(fn (EventSubmission $record) => $record->update([
                'status' => EventSubmissionStatus::Processed,
            ]));
    }

    public static function markNewAction(): Action
    {
        return Action::make('markNew')
            ->label(__('filament-resources.event-submissions.actions.mark_new'))
            ->visible(fn (EventSubmission $record): bool => $record->status === EventSubmissionStatus::Processed)
            ->action(fn (EventSubmission $record) => $record->update([
                'status' => EventSubmissionStatus::New,
            ]));
    }

    public static function getPages(): array
    {
        return [
            'index' => ListEventSubmissions::route('/'),
            'view' => ViewEventSubmission::route('/{record}'),
        ];
    }
}
```

`Pages/ListEventSubmissions.php`:

```php
<?php

namespace App\Filament\Resources\EventSubmissions\Pages;

use App\Filament\Resources\EventSubmissions\EventSubmissionResource;
use Filament\Resources\Pages\ListRecords;

class ListEventSubmissions extends ListRecords
{
    protected static string $resource = EventSubmissionResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
```

`Pages/ViewEventSubmission.php`:

```php
<?php

namespace App\Filament\Resources\EventSubmissions\Pages;

use App\Filament\Resources\EventSubmissions\EventSubmissionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\ViewRecord;

class ViewEventSubmission extends ViewRecord
{
    protected static string $resource = EventSubmissionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EventSubmissionResource::markProcessedAction(),
            EventSubmissionResource::markNewAction(),
            DeleteAction::make(),
        ];
    }
}
```

Если Filament 4 ругается на `Infolists\Components\TextEntry` в `Schema` — взять те же `TextEntry` / `Section`, что уже импортирует актуальный `TagResource` в этой версии, не меняя состав полей.

- [ ] **Step 4: Run tests**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-back && php artisan test --filter=EventSubmission`

Expected: PASS `EventSubmissionApiTest` и `EventSubmissionResourceTest`.

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-back
git add app/Filament/Resources/EventSubmissions lang/ru/filament-resources.php tests/Feature/EventSubmissionResourceTest.php
git commit -m "$(cat <<'EOF'
Показываем заявки в Filament: список, просмотр и статус.

EOF
)"
```

---

### Task 5: Форма на фронте и hCaptcha

**Files:**
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/package.json` — зависимость `@hcaptcha/react-hcaptcha`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/src/config/env.ts`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/.env.example`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/src/lib/api/v1.d.ts` — path + operation (до деплоя `generate-api`)
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/src/app/events/new/new-event-form.tsx`
- Modify: `/Users/dzorogh/Develop/workevent/workevent-front/src/app/events/new/page.tsx`
- Delete: `/Users/dzorogh/Develop/workevent/workevent-front/src/lib/event-submissions.ts`
- Repo: `workevent-front`

**Interfaces:**
- Consumes: `Api.POST('/v1/event-submissions', { body, cache: 'no-store' })`; `env.hcaptchaSiteKey`
- Produces: форма без `localStorage`; токен только на сабмите; тосты как в спеке

- [ ] **Step 1: Install widget and env**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
npm install @hcaptcha/react-hcaptcha
```

`src/config/env.ts`:

```ts
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  hcaptchaSiteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!,
} as const;

if (!env.apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

if (!env.hcaptchaSiteKey) {
  throw new Error('NEXT_PUBLIC_HCAPTCHA_SITEKEY is not defined');
}
```

В `.env.example` и локальный `.env` (тестовый публичный sitekey):

```
NEXT_PUBLIC_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
```

В чат значения прод-ключей не писать. Прод-sitekey — в Dokploy frontend env.

- [ ] **Step 2: Add OpenAPI types**

В `paths` добавить (алфавит не важен, рядом с events):

```ts
    "/v1/event-submissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["eventSubmission.store"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
```

В `operations` добавить:

```ts
    "eventSubmission.store": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    title: string;
                    date_from: string;
                    date_to?: string;
                    city: string;
                    industry_id?: number;
                    contact: string;
                    comment?: string;
                    "h-captcha-response": string;
                };
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        data: {
                            id: number;
                        };
                    };
                };
            };
            422: components["responses"]["ValidationException"];
        };
    };
```

- [ ] **Step 3: Wire the form**

`page.tsx` — заменить абзац на:

```tsx
        <p className="text-muted-foreground-dark">
          Заявка уйдёт в каталог. Свяжемся, чтобы уточнить детали и опубликовать карточку.
        </p>
```

`new-event-form.tsx` — убрать `saveEventSubmission`. Добавить `HCaptcha`, `env`, `Api`. Схема та же, имена полей формы можно оставить camelCase локально и маппить в snake_case при POST.

Ключевые куски (остальная вёрстка полей как сейчас):

```tsx
import { useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Api } from '@/lib/api';
import { env } from '@/config/env';

const captchaRef = useRef<HCaptcha>(null);
const [captchaError, setCaptchaError] = useState<string | null>(null);

async function onSubmit(data: FormValues) {
  setCaptchaError(null);
  captchaRef.current?.resetCaptcha();

  let token: string;
  try {
    const executed = await captchaRef.current?.execute({ async: true });
    token = typeof executed === 'string' ? executed : executed?.response ?? '';
  } catch {
    setCaptchaError('Пройдите проверку ещё раз');
    return;
  }

  if (!token) {
    setCaptchaError('Пройдите проверку ещё раз');
    return;
  }

  const industry = industries.find((item) => item.id.toString() === data.industryId);
  const { error, response } = await Api.POST('/v1/event-submissions', {
    body: {
      title: data.title,
      date_from: data.dateFrom,
      date_to: data.dateTo || undefined,
      city: data.city,
      industry_id: industry ? industry.id : undefined,
      contact: data.contact,
      comment: data.comment || undefined,
      'h-captcha-response': token,
    },
    cache: 'no-store',
  });

  captchaRef.current?.resetCaptcha();

  if (!error && response.ok) {
    toast({ title: 'Заявку приняли, свяжемся' });
    form.reset();
    return;
  }

  const status = response.status;
  if (status === 422) {
    const fieldErrors = (error as { errors?: Record<string, string[]> } | undefined)?.errors ?? {};
    for (const [field, messages] of Object.entries(fieldErrors)) {
      const formField = field === 'date_from' ? 'dateFrom'
        : field === 'date_to' ? 'dateTo'
        : field === 'industry_id' ? 'industryId'
        : field === 'h-captcha-response' ? undefined
        : field;
      if (formField && messages[0]) {
        form.setError(formField as keyof FormValues, { message: messages[0] });
      }
      if (field === 'h-captcha-response') {
        setCaptchaError(messages[0] ?? 'Пройдите проверку ещё раз');
      }
    }
    return;
  }

  toast({
    title: status === 429 ? 'Слишком много попыток, подождите минуту' : 'Попробуйте позже',
    variant: 'destructive',
  });
}
```

В JSX перед кнопкой:

```tsx
        <div className="flex flex-col gap-2">
          <HCaptcha
            ref={captchaRef}
            sitekey={env.hcaptchaSiteKey}
            onExpire={() => captchaRef.current?.resetCaptcha()}
            languageOverride="ru"
          />
          {captchaError && (
            <p className="text-destructive text-sm">{captchaError}</p>
          )}
        </div>
```

Если `execute({ async: true })` в текущей версии пакета возвращает другую форму — взять токен из `onVerify` после `execute()`, не убирать сброс после ответа.

Удалить `src/lib/event-submissions.ts`. Проверить, что больше никто его не импортирует.

- [ ] **Step 4: Typecheck**

Run: `cd /Users/dzorogh/Develop/workevent/workevent-front && npx tsc --noEmit`

Expected: без ошибок по `events/new` и `env.ts`. Если `execute` типы не совпали — поправить вызов, не ослаблять капчу.

В браузере на `/events/new`: валидация полей, отказ без капчи, успешный POST на локальный бэк с тестовым sitekey, тост, пустая форма. `localStorage` ключ `workevent:event-submissions` больше не появляется.

- [ ] **Step 5: Commit**

```bash
cd /Users/dzorogh/Develop/workevent/workevent-front
git add package.json package-lock.json src/config/env.ts .env.example src/lib/api/v1.d.ts src/app/events/new/new-event-form.tsx src/app/events/new/page.tsx
git rm -f src/lib/event-submissions.ts
git commit -m "$(cat <<'EOF'
Отправляем заявку на событие в API и проверяем её hCaptcha.

EOF
)"
```

Не коммитить `.env` / `.env.local`.

---

## После кода (не отдельная задача в git)

В Dokploy, не в репозитории:

- `workevent-app` и Horizon: `MAIL_MAILER=smtp`, хост/порт Gmail из MailFlow, `MAIL_FROM_ADDRESS` того же ящика, `MAIL_USERNAME` / `MAIL_PASSWORD`. Значения в чат не писать.
- Туда же прод `HCAPTCHA_SECRET`, `HCAPTCHA_SITEKEY`, `EVENT_SUBMISSION_NOTIFY_EMAIL=dzorogh@gmail.com`.
- Frontend: прод `NEXT_PUBLIC_HCAPTCHA_SITEKEY`.
- Миграция на бэке.
- Одна живая заявка с `/events/new` → Filament → письмо. Строку удалить сразу.

После деплоя бэка: `npm run generate-api` на фронте, чтобы заменить ручные типы. Если diff только косметический — можно не коммитить отдельно.

---

## Self-review

Spec coverage:

| Спека | Задача |
| --- | --- |
| Таблица + debug + статусы | 1 |
| siteverify form-urlencoded + hostname | 2 |
| POST, 201/422/429/503, mail queue, не жечь токен на 422 полей | 3 |
| Filament read-only + действия статуса | 4 |
| Форма, капча на сабмите, убрать localStorage, копирайт | 5 |
| Ключи Dokploy / SMTP | блок «После кода» |
| Письмо отправителю, Event, event_apply, subscribe, Метрика | вне объёма, задач нет |
