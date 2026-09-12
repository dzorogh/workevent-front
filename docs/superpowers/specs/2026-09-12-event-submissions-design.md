# Заявки «Добавить событие»: бэкенд, Filament, почта, hCaptcha

Дата: 2026-09-12  
Репозитории: `workevent-back` и `workevent-front`.

Сейчас `/events/new` пишет только в `localStorage`. В проде у бэка `MAIL_MAILER=log`. Цель — принимать заявку на сервере, показывать её в Filament и слать письмо на `dzorogh@gmail.com`.

## Вне объёма

- Письмо отправителю
- Конвертация заявки в `Event`
- Форма «Оставить заявку» на странице события (`event_apply`)
- Подписка `/api/subscribe`
- Хранение токена или secret hCaptcha
- Новые цели Метрики

## Решения

| Тема | Решение |
| --- | --- |
| Хранение | Таблица `event_submissions`, не черновик `Event` |
| Статусы | `new` / `processed` |
| Почта | Одно письмо админу после успешной записи. Ошибка SMTP не роняет приём |
| Капча | hCaptcha, проверка на бэке до INSERT |
| `localStorage` | Убрать как хранилище заявок |
| Получатель | `dzorogh@gmail.com` |
| SMTP | Gmail из MailFlow, креды только в Dokploy |

## Поток

1. Пользователь заполняет `/events/new` и жмёт «Отправить».
2. Виджет hCaptcha в этот момент получает свежий токен (~120 с, одноразовый).
3. Фронт шлёт `POST /api/v1/event-submissions` (первый публичный POST в `/api/v1`).
4. Бэкенд валидирует поля, затем сразу вызывает `https://api.hcaptcha.com/siteverify` (`application/x-www-form-urlencoded`: `secret`, `response`, `remoteip`, `sitekey`). Проверку капчи не ставить в очередь.
5. Пускаем только если `success === true` и `hostname` в списке `workevent.ru`, `www.workevent.ru`, `localhost`, `127.0.0.1`.
6. Пишем строку со статусом `new` и debug-полями.
7. Ставим в очередь письмо админу. Ответ клиенту — `201`, в теле только `{ "data": { "id": … } }`. Debug на клиент не отдаём.
8. Лимит: 5 запросов в минуту с IP.

`localStorage` и `src/lib/event-submissions.ts` убираем. Текст на странице больше не говорит, что заявка останется на устройстве: заявка уйдёт в каталог, свяжемся.

## API

`POST /api/v1/event-submissions`

Тело, snake_case как в остальном v1:

| Поле | Правило |
| --- | --- |
| `title` | обязательно, строка, max 255 |
| `date_from` | обязательно, `Y-m-d` |
| `date_to` | необязательно, `Y-m-d`, не раньше `date_from` |
| `city` | обязательно, строка, max 255 |
| `industry_id` | необязательно, `exists:industries,id` |
| `contact` | обязательно, max 255; email или сайт (есть `@`, или `http(s)://`, или `.`) |
| `comment` | необязательно, max 2000 |
| `h-captcha-response` | обязательно, строка |

Ответы:

- `201` — заявка записана
- `422` — поля или капча
- `429` — лимит
- `503` — siteverify недоступен, строку не пишем

CORS должен пускать этот POST с origin фронта (прод и localhost). Эндпоинт документируем в Scramble; после деплоя бэка фронт обновляет `src/lib/api/v1.d.ts` через `npm run generate-api`. До деплоя типы можно дописать вручную, чтобы форма собиралась.

## Модель

Таблица `event_submissions`:

- `id`
- `title`, `date_from`, `date_to` (nullable), `city`, `industry_id` (nullable FK), `contact`, `comment` (nullable)
- `status` — `new` / `processed`, индекс, по умолчанию `new`
- debug: `ip`, `user_agent`, `referer`, `hcaptcha_hostname`, `hcaptcha_challenge_ts`
- `created_at`, `updated_at`

Токен капчи и secret не храним. IP — из запроса Laravel, не из тела.

## hCaptcha

Актуальный siteverify, не «токен есть — значит ок».

- Фронт: `@hcaptcha/react-hcaptcha`, токен на сабмите, не при загрузке страницы.
- Бэк: сервис проверки. POST form-urlencoded, не JSON и не GET.
- Отказ или протухший/повторный токен — `422` на поле капчи, виджет сбрасывается, поля формы остаются.
- Siteverify недоступен — `503`, тост «попробуйте позже».
- Если на сайте есть CSP — разрешить `https://hcaptcha.com` и `https://*.hcaptcha.com` для script/frame/style/connect.

Ключи:

- Фронт: `NEXT_PUBLIC_HCAPTCHA_SITEKEY`
- Бэк: `HCAPTCHA_SECRET`, `HCAPTCHA_SITEKEY`
- Локально — официальные тестовые ключи hCaptcha (always-pass). В проде — свои. Значения не в git и не в чат.

## Filament

Ресурс «Заявки»:

- Список: новые сверху. Колонки — название, город, даты, контакт, статус, создана.
- Фильтр по статусу.
- Карточка только чтение, включая debug-поля.
- Действия: «обработана», вернуть в «новые», удаление.
- Создавать заявку из админки не нужно. В `Event` не конвертируем.

## Почта

После INSERT — queued mailable на `dzorogh@gmail.com`.

- Тема: `Новая заявка: {title}`
- Тело: все поля формы, статус, id, ссылка в Filament, debug (ip, user_agent, referer, hostname, challenge_ts)
- Отправителю ничего
- SMTP не отправился — заявка уже в БД, ответ всё равно `201`, ошибка только в лог

Прод: в Dokploy у `workevent-app` (и воркера Horizon, если у него свой env) `MAIL_MAILER=smtp` и креды Gmail из MailFlow. `MAIL_FROM_ADDRESS` — тот же ящик, с которого идёт SMTP. Значения только в Dokploy.

Локально почта может остаться `log`.

## Фронт

`NewEventForm` шлёт в `Api.POST('/v1/event-submissions')`. Поля в snake_case. Капча обязательна до запроса.

- Успех: тост «Заявку приняли, свяжемся», форма пустая, виджет сброшен
- 422: ошибки под полями, капча сброшена
- 429 / 503 / сеть: тост, форма живая, капча сброшена

## Ошибки

| Случай | Поведение |
| --- | --- |
| Капча не прошла / токен протух | 422, без INSERT |
| hCaptcha API лежит | 503, без INSERT |
| Поля невалидны | 422, siteverify не вызываем — одноразовый токен не сжигаем на опечатке |
| Письмо не ушло | 201, лог |
| Лимит | 429 |

Порядок на бэке: валидация полей → siteverify → INSERT → очередь письма. Если полей не хватает, siteverify не вызываем.

## Проверка

Автотесты бэка с HTTP-моком siteverify:

- отказ капчи — 422, строки нет, письма нет
- успех — строка с полями и debug, письмо в очереди, `201`
- пустые поля — 422 без вызова siteverify
- лимит — 429
- siteverify 5xx — 503, строки нет

Живой siteverify и реальный SMTP в CI не дергаем.

После деплоя: одна заявка с `/events/new`, она в Filament, письмо на `dzorogh@gmail.com`. Тестовую строку удалить в той же сессии.
