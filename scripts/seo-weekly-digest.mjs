#!/usr/bin/env node
/**
 * Weekly SEO digest for workevent.ru → Telegram.
 *
 * Collects previous complete Mon–Sun (Europe/Moscow) vs the week before:
 *   Yandex Webmaster — ИКС, index, diagnostics, sitemaps, top queries
 *   Yandex Metrika  — organic visits + goals (counter 99029501)
 *
 * Usage:
 *   node scripts/seo-weekly-digest.mjs
 *   node scripts/seo-weekly-digest.mjs --dry-run
 *
 * Loads .env.local in-process. Never prints tokens or Authorization.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const HOST_ID = 'https:workevent.ru:443';
const COUNTER_ID = 99029501;
const ORGANIC_SEGMENT_ID = '1008074935';
const ORGANIC_FILTER =
  "ym:s:lastSignTrafficSource=='organic' AND ym:s:lastSignSearchEngineRoot=.('yandex','google')";
const GOALS = [
  { id: 599688992, key: 'event_apply', label: 'Заявки' },
  { id: 599688993, key: 'newsletter_subscribe', label: 'Подписки' },
  { id: 599688994, key: 'organizer_goto', label: '/goto' },
];
const SNAPSHOT_PATH = resolve(root, 'seo/weekly-digest-last.json');
const TOP_QUERIES = 10;
const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const PROBLEM_RU = {
  DUPLICATE_PAGES: 'дубли страниц',
  NO_REGIONS: 'не указан регион',
  NOT_IN_SPRAV: 'нет в Справочнике',
  ERRORS_IN_SITEMAPS: 'ошибки sitemap',
  NO_SITEMAPS: 'нет sitemap',
  NO_SITEMAP_MODIFICATIONS: 'sitemap давно не обновлялся',
  MAIN_MIRROR: 'главное зеркало',
  DISALLOWED_IN_ROBOTS: 'закрыто в robots',
  SLOW_LOADING: 'медленная загрузка',
};

function loadEnv() {
  const env = { ...process.env };
  const files = [resolve(root, '.env.local'), resolve(root, '.env')];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (env[m[1]] == null || env[m[1]] === '') env[m[1]] = v;
    }
  }
  return env;
}

function requireEnv(env, keys) {
  const missing = keys.filter((k) => !env[k] || String(env[k]).trim() === '');
  if (missing.length) {
    throw new Error(`Missing env keys: ${missing.join(', ')}`);
  }
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function ymd(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function moscowNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
  return new Date(Number(get('year')), Number(get('month')) - 1, Number(get('day')), 12, 0, 0);
}

function previousCompleteWeeks() {
  const now = moscowNow();
  const dow = now.getDay(); // 0 Sun … 6 Sat, already Moscow calendar date
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - daysFromMonday);
  const prevMonday = new Date(thisMonday);
  prevMonday.setDate(thisMonday.getDate() - 7);
  const prevSunday = new Date(thisMonday);
  prevSunday.setDate(thisMonday.getDate() - 1);
  const beforeMonday = new Date(prevMonday);
  beforeMonday.setDate(prevMonday.getDate() - 7);
  const beforeSunday = new Date(prevMonday);
  beforeSunday.setDate(prevMonday.getDate() - 1);
  return {
    current: { from: ymd(prevMonday), to: ymd(prevSunday) },
    previous: { from: ymd(beforeMonday), to: ymd(beforeSunday) },
    label: formatRangeRu(prevMonday, prevSunday),
  };
}

function formatRangeRu(from, to) {
  const a = `${from.getDate()}–${to.getDate()} ${MONTHS_RU[to.getMonth()]}`;
  if (from.getMonth() !== to.getMonth() || from.getFullYear() !== to.getFullYear()) {
    return `${from.getDate()} ${MONTHS_RU[from.getMonth()]}–${to.getDate()} ${MONTHS_RU[to.getMonth()]}`;
  }
  return a;
}

function delta(curr, prev) {
  if (curr == null || prev == null || Number.isNaN(curr) || Number.isNaN(prev)) return null;
  return curr - prev;
}

function fmtNum(n, digits = 0) {
  if (n == null || Number.isNaN(n)) return 'н/д';
  const v = Number(n);
  if (!Number.isFinite(v)) return 'н/д';
  return v.toLocaleString('ru-RU', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fmtDelta(d, digits = 0) {
  if (d == null || Number.isNaN(d)) return 'н/д';
  const sign = d > 0 ? '+' : '';
  return `${sign}${fmtNum(d, digits)}`;
}

function fmtWithDelta(curr, prev, digits = 0) {
  const d = delta(curr, prev);
  if (d == null) return fmtNum(curr, digits);
  return `${fmtNum(curr, digits)} (${fmtDelta(d, digits)})`;
}

async function apiJson(url, token, { method = 'GET' } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `OAuth ${token}`,
      Accept: 'application/json',
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, ok: res.ok, body };
}

function indicator(row, name) {
  const indicators = row?.indicators ?? {};
  const v = indicators[name];
  return typeof v === 'number' ? v : v != null ? Number(v) : null;
}

function loadSnapshot() {
  if (!existsSync(SNAPSHOT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  } catch {
    return null;
  }
}

async function collectWebmaster(token, weeks) {
  const gaps = [];
  const userRes = await apiJson('https://api.webmaster.yandex.net/v4/user', token);
  if (userRes.status === 401) {
    return { expired: true, gaps: ['webmaster: HTTP 401'] };
  }
  if (!userRes.ok || userRes.body?.user_id == null) {
    gaps.push(`webmaster /v4/user HTTP ${userRes.status}`);
    return { http: { user: userRes.status }, gaps, expired: false };
  }
  const userId = userRes.body.user_id;
  const hostEnc = encodeURIComponent(HOST_ID);
  const base = `https://api.webmaster.yandex.net/v4/user/${userId}/hosts/${hostEnc}`;

  const [summaryRes, diagRes, smRes, qCurrRes, qPrevRes] = await Promise.all([
    apiJson(`${base}/summary`, token),
    apiJson(`${base}/diagnostics`, token),
    apiJson(`${base}/sitemaps?limit=100`, token),
    apiJson(
      `${base}/search-queries/popular?order_by=TOTAL_SHOWS&limit=${TOP_QUERIES}` +
        `&query_indicator=TOTAL_SHOWS&query_indicator=TOTAL_CLICKS&query_indicator=AVG_SHOW_POSITION` +
        `&date_from=${weeks.current.from}&date_to=${weeks.current.to}`,
      token,
    ),
    apiJson(
      `${base}/search-queries/popular?order_by=TOTAL_SHOWS&limit=${TOP_QUERIES}` +
        `&query_indicator=TOTAL_SHOWS&query_indicator=TOTAL_CLICKS&query_indicator=AVG_SHOW_POSITION` +
        `&date_from=${weeks.previous.from}&date_to=${weeks.previous.to}`,
      token,
    ),
  ]);

  const http = {
    user: userRes.status,
    summary: summaryRes.status,
    diagnostics: diagRes.status,
    sitemaps: smRes.status,
    popularCurrent: qCurrRes.status,
    popularPrevious: qPrevRes.status,
  };

  if (!summaryRes.ok) gaps.push(`webmaster summary HTTP ${summaryRes.status}`);
  if (!diagRes.ok) gaps.push(`webmaster diagnostics HTTP ${diagRes.status}`);
  if (!smRes.ok) gaps.push(`webmaster sitemaps HTTP ${smRes.status}`);
  if (!qCurrRes.ok) gaps.push(`webmaster popular queries HTTP ${qCurrRes.status}`);

  const summary = summaryRes.body ?? {};
  const problemsObj = diagRes.body?.problems ?? {};
  const problems = Object.entries(problemsObj)
    .filter(([, v]) => (v?.state ?? '').toUpperCase() === 'PRESENT')
    .map(([code, v]) => ({
      code,
      severity: v.severity ?? '',
      label: PROBLEM_RU[code] ?? code,
    }));

  const sitemaps = (smRes.body?.sitemaps ?? []).map((s) => ({
    url: s.sitemap_url ?? s.url ?? '',
    type: s.sitemap_type ?? s.type ?? '',
    last_access_date: s.last_access_date ?? null,
    errors_count: s.errors_count ?? 0,
    urls_count: s.urls_count ?? null,
  }));

  const mapQueries = (body) =>
    (body?.queries ?? []).slice(0, TOP_QUERIES).map((q) => ({
      text: q.query_text ?? '',
      shows: indicator(q, 'TOTAL_SHOWS'),
      clicks: indicator(q, 'TOTAL_CLICKS'),
      position: indicator(q, 'AVG_SHOW_POSITION'),
    }));

  return {
    expired: false,
    http,
    gaps,
    userId,
    hostId: HOST_ID,
    sqi: summary.sqi ?? null,
    searchable_pages_count: summary.searchable_pages_count ?? null,
    excluded_pages_count: summary.excluded_pages_count ?? null,
    site_problems: summary.site_problems ?? {},
    problems,
    sitemaps,
    queries: mapQueries(qCurrRes.body),
    queriesPrev: mapQueries(qPrevRes.body),
    queriesPeriod: {
      from: qCurrRes.body?.date_from ?? weeks.current.from,
      to: qCurrRes.body?.date_to ?? weeks.current.to,
    },
  };
}

function metrikaTotals(body) {
  const totals = body?.totals;
  if (!Array.isArray(totals) || totals.length === 0) return null;
  const row = Array.isArray(totals[0]) ? totals[0] : totals;
  if (row.length < 4) return null;
  return {
    visits: Number(row[0]),
    event_apply: Number(row[1]),
    newsletter_subscribe: Number(row[2]),
    organizer_goto: Number(row[3]),
  };
}

async function collectMetrika(token, weeks) {
  const gaps = [];
  const metrics = [
    'ym:s:visits',
    ...GOALS.map((g) => `ym:s:goal${g.id}reaches`),
  ].join(',');

  const statUrl = (from, to, extra) => {
    const u = new URL('https://api-metrika.yandex.net/stat/v1/data');
    u.searchParams.set('ids', String(COUNTER_ID));
    u.searchParams.set('metrics', metrics);
    u.searchParams.set('date1', from);
    u.searchParams.set('date2', to);
    u.searchParams.set('accuracy', 'full');
    u.searchParams.set('lang', 'ru');
    for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
    return u.toString();
  };

  const [orgCurr, orgPrev, totCurr, totPrev] = await Promise.all([
    apiJson(statUrl(weeks.current.from, weeks.current.to, { filters: ORGANIC_FILTER }), token),
    apiJson(statUrl(weeks.previous.from, weeks.previous.to, { filters: ORGANIC_FILTER }), token),
    apiJson(statUrl(weeks.current.from, weeks.current.to, {}), token),
    apiJson(statUrl(weeks.previous.from, weeks.previous.to, {}), token),
  ]);

  const http = {
    organicCurrent: orgCurr.status,
    organicPrevious: orgPrev.status,
    totalsCurrent: totCurr.status,
    totalsPrevious: totPrev.status,
  };

  if (orgCurr.status === 401 || totCurr.status === 401) {
    return { expired: true, http, gaps: ['metrika: HTTP 401'] };
  }
  if (!orgCurr.ok) gaps.push(`metrika organic HTTP ${orgCurr.status}`);
  if (!totCurr.ok) gaps.push(`metrika totals HTTP ${totCurr.status}`);

  const organic = metrikaTotals(orgCurr.body);
  const organicPrev = metrikaTotals(orgPrev.body);
  const totals = metrikaTotals(totCurr.body);
  const totalsPrev = metrikaTotals(totPrev.body);

  const organicGoalsOk = Boolean(orgCurr.ok && organic);
  if (!organicGoalsOk) {
    gaps.push('metrika: organic+goals недоступны, в отчёте totals');
  }

  return {
    expired: false,
    http,
    gaps,
    counterId: COUNTER_ID,
    segmentId: ORGANIC_SEGMENT_ID,
    organicGoalsOk,
    organic,
    organicPrev,
    totals,
    totalsPrev,
  };
}

function sitemapAlerts(sitemaps) {
  const alerts = [];
  if (!sitemaps.length) {
    alerts.push('Sitemap в Вебмастере не найден');
    return alerts;
  }
  for (const sm of sitemaps) {
    const name = sm.url.replace('https://workevent.ru', '') || sm.url;
    if ((sm.errors_count ?? 0) > 0) {
      alerts.push(`Sitemap ${name}: ошибок ${sm.errors_count}`);
    }
    if (sm.last_access_date) {
      const accessed = new Date(sm.last_access_date);
      const ageDays = Math.floor((Date.now() - accessed.getTime()) / 86400000);
      if (ageDays >= 10) {
        alerts.push(`Sitemap ${name}: последний обход ${ageDays} дн. назад`);
      }
    }
  }
  return alerts;
}

function buildMessage({ weeks, webmaster, metrika, snapshot }) {
  const lines = [];
  lines.push(`📊 Workevent SEO · ${weeks.label}`);
  lines.push('');

  lines.push('Индекс');
  const prevIdx = snapshot?.webmaster;
  lines.push(`• ИКС: ${fmtWithDelta(webmaster.sqi, prevIdx?.sqi)}`);
  lines.push(
    `• В поиске: ${fmtWithDelta(webmaster.searchable_pages_count, prevIdx?.searchable_pages_count)}`,
  );
  lines.push(
    `• Исключено: ${fmtWithDelta(webmaster.excluded_pages_count, prevIdx?.excluded_pages_count)}`,
  );
  if (webmaster.problems?.length) {
    const text = webmaster.problems
      .map((p) => `${p.label}${p.severity ? ` [${p.severity}]` : ''}`)
      .join('; ');
    lines.push(`• Проблемы: ${text}`);
  } else {
    lines.push('• Проблемы: нет');
  }
  if (webmaster.sitemaps?.length) {
    const sm = webmaster.sitemaps
      .map((s) => {
        const name = s.url.replace('https://workevent.ru', '') || s.url;
        const when = s.last_access_date
          ? s.last_access_date.slice(0, 10)
          : 'н/д';
        const err = s.errors_count ? `, ошибок ${s.errors_count}` : '';
        return `${name} · ${when}${err}`;
      })
      .join('; ');
    lines.push(`• Sitemap: ${sm}`);
  } else {
    lines.push('• Sitemap: н/д');
  }

  lines.push('');
  lines.push('Органика');
  const org = metrika.organic;
  const orgPrev = metrika.organicPrev;
  const tot = metrika.totals;
  const totPrev = metrika.totalsPrev;
  if (metrika.organicGoalsOk && org) {
    lines.push(`• Визиты: ${fmtWithDelta(org.visits, orgPrev?.visits)}`);
    lines.push(`• Заявки: ${fmtWithDelta(org.event_apply, orgPrev?.event_apply)}`);
    lines.push(`• Подписки: ${fmtWithDelta(org.newsletter_subscribe, orgPrev?.newsletter_subscribe)}`);
    lines.push(`• /goto: ${fmtWithDelta(org.organizer_goto, orgPrev?.organizer_goto)}`);
    if (tot) {
      lines.push(
        `• Всего (не только органика): визиты ${fmtWithDelta(tot.visits, totPrev?.visits)}, заявки ${fmtNum(tot.event_apply)}, подписки ${fmtNum(tot.newsletter_subscribe)}, /goto ${fmtNum(tot.organizer_goto)}`,
      );
    }
  } else {
    lines.push('• Органика+цели: н/д (ниже — totals по счётчику)');
    lines.push(`• Визиты: ${fmtWithDelta(tot?.visits, totPrev?.visits)}`);
    lines.push(`• Заявки: ${fmtWithDelta(tot?.event_apply, totPrev?.event_apply)}`);
    lines.push(`• Подписки: ${fmtWithDelta(tot?.newsletter_subscribe, totPrev?.newsletter_subscribe)}`);
    lines.push(`• /goto: ${fmtWithDelta(tot?.organizer_goto, totPrev?.organizer_goto)}`);
  }

  lines.push('');
  lines.push('Топ-запросы');
  const queries = webmaster.queries ?? [];
  if (!queries.length) {
    lines.push('• н/д за выбранную неделю');
  } else {
    queries.forEach((q, i) => {
      const pos = q.position == null ? 'н/д' : fmtNum(q.position, 1);
      lines.push(
        `${i + 1}. ${q.text || '—'} — ${fmtNum(q.shows)} / ${fmtNum(q.clicks)} / ${pos}`,
      );
    });
  }

  lines.push('');
  lines.push('Алерты');
  const alerts = [];
  for (const p of webmaster.problems ?? []) {
    if (p.severity === 'FATAL' || p.severity === 'CRITICAL' || p.severity === 'POSSIBLE_PROBLEM') {
      alerts.push(`${p.label} (${p.severity})`);
    }
  }
  alerts.push(...sitemapAlerts(webmaster.sitemaps ?? []));
  if (org && orgPrev && orgPrev.visits > 0) {
    const drop = (orgPrev.visits - org.visits) / orgPrev.visits;
    if (drop >= 0.3) {
      alerts.push(`Органика упала на ${fmtNum(drop * 100)}% к прошлой неделе`);
    }
  }
  if (webmaster.gaps?.length) alerts.push(...webmaster.gaps.map((g) => `API: ${g}`));
  if (metrika.gaps?.length) alerts.push(...metrika.gaps.map((g) => `API: ${g}`));
  if (!alerts.length) {
    lines.push('• нет критичных');
  } else {
    for (const a of alerts) lines.push(`• ${a}`);
  }

  lines.push('');
  lines.push(`Неделя ${weeks.current.from} — ${weeks.current.to} vs ${weeks.previous.from} — ${weeks.previous.to} (МСК)`);

  return lines.join('\n');
}

function writeSnapshot({ weeks, webmaster, metrika }) {
  const snapshot = {
    generatedAt: new Date().toISOString(),
    timezone: 'Europe/Moscow',
    week: weeks.current,
    previousWeek: weeks.previous,
    webmaster: {
      hostId: HOST_ID,
      sqi: webmaster.sqi ?? null,
      searchable_pages_count: webmaster.searchable_pages_count ?? null,
      excluded_pages_count: webmaster.excluded_pages_count ?? null,
      problems: (webmaster.problems ?? []).map((p) => ({
        code: p.code,
        severity: p.severity,
      })),
      sitemaps: (webmaster.sitemaps ?? []).map((s) => ({
        url: s.url,
        last_access_date: s.last_access_date,
        errors_count: s.errors_count,
      })),
      queries: webmaster.queries ?? [],
    },
    metrika: {
      counterId: COUNTER_ID,
      segmentId: ORGANIC_SEGMENT_ID,
      organicGoalsOk: metrika.organicGoalsOk ?? false,
      organic: metrika.organic ?? null,
      totals: metrika.totals ?? null,
    },
  };
  try {
    mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
    writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.log(`snapshot: skipped (${err.code ?? err.message})`);
  }
}

async function sendTelegram(env, text) {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      disable_web_page_preview: true,
    }),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return {
    httpStatus: res.status,
    ok: Boolean(body?.ok),
    message_id: body?.result?.message_id ?? null,
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const env = loadEnv();
  requireEnv(env, [
    'YANDEX_API_ACCESS_TOKEN',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
  ]);

  const weeks = previousCompleteWeeks();
  const token = env.YANDEX_API_ACCESS_TOKEN;

  const webmaster = await collectWebmaster(token, weeks);
  if (webmaster.expired) {
    console.error('Yandex access expired: webmaster HTTP 401. Refresh not performed.');
    process.exit(2);
  }
  const metrika = await collectMetrika(token, weeks);
  if (metrika.expired) {
    console.error('Yandex access expired: metrika HTTP 401. Refresh not performed.');
    process.exit(2);
  }

  const snapshot = loadSnapshot();
  const message = buildMessage({ weeks, webmaster, metrika, snapshot });

  console.log(`week: ${weeks.current.from} — ${weeks.current.to} vs ${weeks.previous.from} — ${weeks.previous.to}`);
  console.log(`webmaster HTTP: user=${webmaster.http?.user} summary=${webmaster.http?.summary} diagnostics=${webmaster.http?.diagnostics} sitemaps=${webmaster.http?.sitemaps} queries=${webmaster.http?.popularCurrent}`);
  console.log(`metrika HTTP: organic=${metrika.http?.organicCurrent} totals=${metrika.http?.totalsCurrent}`);
  console.log(`sections: index=${webmaster.sqi != null} organic=${Boolean(metrika.organic || metrika.totals)} queries=${(webmaster.queries ?? []).length} alerts=yes`);
  if (webmaster.gaps?.length) console.log(`webmaster gaps: ${webmaster.gaps.join('; ')}`);
  if (metrika.gaps?.length) console.log(`metrika gaps: ${metrika.gaps.join('; ')}`);

  if (dryRun) {
    console.log('--- message ---');
    console.log(message);
    console.log('--- end ---');
    console.log('dry-run: telegram not sent');
    return;
  }

  const tg = await sendTelegram(env, message);
  console.log(`telegram: HTTP ${tg.httpStatus} ok=${tg.ok} message_id=${tg.message_id ?? 'n/a'}`);
  if (!tg.ok) {
    process.exit(1);
  }

  writeSnapshot({ weeks, webmaster, metrika });
  console.log('snapshot: seo/weekly-digest-last.json');
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
