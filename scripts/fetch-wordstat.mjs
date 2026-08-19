#!/usr/bin/env node
/**
 * Снимает частотности Yandex Cloud Wordstat v2 (Search API).
 * Секреты не печатает: только имена переменных, HTTP-статусы, фразы и числа.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");
const OUT_PATH = path.join(ROOT, "seo/wordstat-report.json");
const CORE_PATH = path.join(ROOT, "seo/semantic-core.json");

const REGION_RU = "225";
const REGION_MSK = "213";
const TOP_REQUESTS = "https://searchapi.api.cloud.yandex.net/v2/wordstat/topRequests";
const LLM_COMPLETION = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toInt(value) {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
}

async function postJson(url, { apiKey, body }) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, text: text.slice(0, 400) };
}

function extractFolderId(payload) {
  const blob = typeof payload === "string" ? payload : JSON.stringify(payload ?? "");
  const match =
    blob.match(/service account folder ID ['"]([a-z0-9]+)['"]/i) ||
    blob.match(/folder ID ['"]([a-z0-9]+)['"]/i) ||
    blob.match(/folderId['"]?\s*[:=]\s*['"]([a-z0-9]+)['"]/i);
  return match?.[1] ?? null;
}

async function resolveFolderId(apiKey) {
  const fromEnv = [
    process.env.YANDEX_API_FOLDER_ID,
    process.env.YANDEX_FOLDER_ID,
    process.env.YC_FOLDER_ID,
  ].find((v) => v && String(v).trim());
  if (fromEnv) return { folderId: fromEnv.trim(), source: "env" };

  const probe = await postJson(TOP_REQUESTS, {
    apiKey,
    body: { phrase: "мероприятия", numPhrases: 1, regions: [REGION_RU], folderId: "test" },
  });
  const fromWordstat = extractFolderId(probe.json ?? probe.text);
  if (fromWordstat) return { folderId: fromWordstat, source: "wordstat-error" };

  const llm = await postJson(LLM_COMPLETION, {
    apiKey,
    body: {
      modelUri: "gpt://test/yandexgpt/latest",
      completionOptions: { stream: false, temperature: 0.1, maxTokens: "1" },
      messages: [{ role: "user", text: "ok" }],
    },
  });
  const fromLlm = extractFolderId(llm.json ?? llm.text);
  if (fromLlm) return { folderId: fromLlm, source: "llm-error" };

  return {
    folderId: null,
    source: "missing",
    probe: { wordstat: probe.status, llm: llm.status },
  };
}

async function topRequests(apiKey, folderId, phrase, regions, numPhrases = 40) {
  const { status, json, text } = await postJson(TOP_REQUESTS, {
    apiKey,
    body: { phrase, numPhrases, regions, folderId },
  });
  if (status !== 200 || !json) {
    return { phrase, regions, status, error: json?.message || json?.code || text, totalCount: null, results: [], associations: [] };
  }
  return {
    phrase,
    regions,
    status,
    totalCount: toInt(json.totalCount),
    results: (json.results ?? []).map((row) => ({ phrase: row.phrase, count: toInt(row.count) })),
    associations: (json.associations ?? []).map((row) => ({ phrase: row.phrase, count: toInt(row.count) })),
  };
}

function loadSeeds() {
  const seeds = [
    { cluster: "ВЧ-разведка", phrase: "мероприятия", region: REGION_RU },
    { cluster: "ВЧ-разведка", phrase: "деловые мероприятия", region: REGION_RU },
    { cluster: "ВЧ-разведка", phrase: "конференции", region: REGION_RU },
    { cluster: "ВЧ-разведка", phrase: "выставки", region: REGION_RU },
    { cluster: "ВЧ-разведка", phrase: "форумы", region: REGION_RU },
    { cluster: "ВЧ-разведка", phrase: "бизнес мероприятия", region: REGION_RU },
    { cluster: "ВЧ-разведка", phrase: "календарь мероприятий", region: REGION_RU },
    { cluster: "Каталог мероприятий", phrase: "каталог деловых мероприятий", region: REGION_RU },
    { cluster: "Каталог мероприятий", phrase: "бизнес мероприятия россия", region: REGION_RU },
    { cluster: "Каталог мероприятий", phrase: "конференции форумы выставки", region: REGION_RU },
    { cluster: "Каталог мероприятий", phrase: "афиша деловых событий", region: REGION_RU },
    { cluster: "Каталог мероприятий", phrase: "деловые мероприятия 2026", region: REGION_RU },
    { cluster: "Каталог мероприятий", phrase: "каталог конференций россии", region: REGION_RU },
    { cluster: "Каталог мероприятий", phrase: "деловые мероприятия россия", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "мероприятия в москве", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "мероприятия москва", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "конференции москва", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "конференции в москве", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "выставки в москве 2026", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "выставки в москве", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "форумы москва", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "конференции в санкт-петербурге", region: REGION_RU },
    { cluster: "Городские посадочные", phrase: "конференции екатеринбург", region: REGION_RU },
    { cluster: "Коммерческие доп.", phrase: "деловые мероприятия москва", region: REGION_RU },
    { cluster: "Коммерческие доп.", phrase: "бизнес конференции москва", region: REGION_RU },
    { cluster: "Коммерческие доп.", phrase: "деловые мероприятия", region: REGION_RU },
    { cluster: "Календарь и планирование", phrase: "календарь мероприятий 2026", region: REGION_RU },
    { cluster: "Календарь и планирование", phrase: "расписание выставок", region: REGION_RU },
    { cluster: "Календарь и планирование", phrase: "календарь конференций 2026", region: REGION_RU },
    { cluster: "Календарь и планирование", phrase: "расписание деловых мероприятий", region: REGION_RU },
    { cluster: "Календарь и планирование", phrase: "план выставок на год", region: REGION_RU },
    { cluster: "Отраслевые посадочные", phrase: "it конференции", region: REGION_RU },
    { cluster: "Отраслевые посадочные", phrase: "hr мероприятия", region: REGION_RU },
    { cluster: "Отраслевые посадочные", phrase: "hr форумы", region: REGION_RU },
    { cluster: "Отраслевые посадочные", phrase: "медицинские выставки", region: REGION_RU },
    { cluster: "Отраслевые посадочные", phrase: "маркетинговые форумы", region: REGION_RU },
    { cluster: "Отраслевые посадочные", phrase: "horeca выставки", region: REGION_RU },
  ];

  if (fs.existsSync(CORE_PATH)) {
    const core = JSON.parse(fs.readFileSync(CORE_PATH, "utf8"));
    for (const cluster of core.clusters ?? []) {
      for (const phrase of cluster.keywords ?? []) {
        if (!seeds.some((s) => s.phrase === phrase)) {
          seeds.push({ cluster: cluster.name, phrase, region: REGION_RU });
        }
      }
    }
  }
  return seeds;
}

function exactCount(item) {
  const needle = item.phrase.toLowerCase();
  const hit = item.results.find((r) => r.phrase.toLowerCase() === needle);
  return hit?.count ?? null;
}

async function main() {
  const fileEnv = loadEnv(ENV_PATH);
  for (const [k, v] of Object.entries(fileEnv)) {
    if (!process.env[k]) process.env[k] = v;
  }

  const apiKey = process.env.YANDEX_API_KEY;
  if (!apiKey) {
    console.error("missing YANDEX_API_KEY");
    process.exit(1);
  }

  const folder = await resolveFolderId(apiKey);
  if (!folder.folderId) {
    console.error(JSON.stringify({ ok: false, reason: "folderId missing", probe: folder.probe }));
    process.exit(2);
  }
  console.log(JSON.stringify({ folderSource: folder.source, hasFolder: true }));

  const seeds = loadSeeds();
  const queries = [];
  const related = new Map();

  for (let i = 0; i < seeds.length; i += 1) {
    const seed = seeds[i];
    const item = await topRequests(apiKey, folder.folderId, seed.phrase, [seed.region]);
    const shows = exactCount(item);
    queries.push({
      cluster: seed.cluster,
      phrase: seed.phrase,
      region: seed.region === REGION_MSK ? "Москва" : "Россия",
      regionId: seed.region,
      shows,
      broadShows: item.totalCount,
      status: item.status,
      error: item.error ?? null,
      topRelated: item.results.slice(0, 8),
      associations: item.associations.slice(0, 6),
    });
    for (const row of [...item.results, ...item.associations]) {
      const key = row.phrase.toLowerCase();
      const prev = related.get(key);
      if (!prev || row.count > prev.count) {
        related.set(key, { phrase: row.phrase, count: row.count, from: seed.phrase });
      }
    }
    process.stdout.write(`${i + 1}/${seeds.length} ${seed.phrase} ${item.status} ${shows ?? "n/a"}\n`);
    await sleep(350);
  }

  const report = {
    site: "https://workevent.ru",
    source: "Yandex Cloud Search API Wordstat v2",
    endpoint: TOP_REQUESTS,
    collectedAt: new Date().toISOString(),
    region: { name: "Россия", id: Number(REGION_RU), lang: "ru" },
    period: "last_30_days",
    status: "ok",
    folderSource: folder.source,
    queryCount: queries.length,
    httpOk: queries.filter((q) => q.status === 200).length,
    queries,
    discoveredTop: [...related.values()].sort((a, b) => b.count - a.count).slice(0, 80),
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    ok: true,
    out: "seo/wordstat-report.json",
    queryCount: report.queryCount,
    httpOk: report.httpOk,
    top5: report.discoveredTop.slice(0, 5).map((r) => ({ phrase: r.phrase, count: r.count })),
  }));
}

main().catch((err) => {
  console.error(err?.message || "wordstat failed");
  process.exit(1);
});
