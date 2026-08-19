#!/usr/bin/env node
/**
 * Interactive shell in a Dokploy container via WebSocket (no VPS SSH required).
 *
 * Usage:
 *   node scripts/dokploy-exec.mjs                    # backend (default)
 *   node scripts/dokploy-exec.mjs --app frontend
 *   node scripts/dokploy-exec.mjs --app backend --shell bash
 *
 * Requires DOCKPLOY_API_KEY and DOCKPLOY_URL in .env.local (repo root).
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import { WebSocket } from "ws";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    /* optional */
  }
  return env;
}

function parseArgs(argv) {
  const args = { app: "backend", shell: "bash" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--app" && argv[i + 1]) args.app = argv[++i];
    else if (argv[i] === "--shell" && argv[i + 1]) args.shell = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
  }
  return args;
}

async function dokployFetch(baseUrl, apiKey, path) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/${path}`, {
    headers: { "x-api-key": apiKey, accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Dokploy API ${path}: ${res.status} ${body}`);
  }
  return res.json();
}

function pickContainer(containers, appName) {
  const running = containers.filter((c) => c.state === "running");
  const named = running.filter((c) => c.name?.includes(appName));
  const app1 = named.find((c) => /-app-1$/.test(c.name || ""));
  if (app1?.containerId) return app1.containerId;

  if (appName.includes("backend")) {
    const fuzzy = running.find((c) => /workevent-backend-.+-app-1$/.test(c.name || ""));
    if (fuzzy?.containerId) return fuzzy.containerId;
  }

  return named[0]?.containerId ?? null;
}

async function resolveContainerId(baseUrl, apiKey, appName) {
  const containers = await dokployFetch(baseUrl, apiKey, "docker.getContainers");
  const fromList = pickContainer(containers, appName);
  if (fromList) return fromList;

  const tasks = await dokployFetch(
    baseUrl,
    apiKey,
    `docker.getServiceContainersByAppName?appName=${encodeURIComponent(appName)}`,
  );
  const ready = tasks.find((t) => t.state === "running" || t.state === "ready");
  if (ready?.containerId) return ready.containerId;
  throw new Error(
    `No running container for "${appName}". Check Dokploy → Terminal tab or redeploy.`,
  );
}

function connectTerminal({ baseUrl, apiKey, containerId, shell }) {
  const wsUrl = new URL("/docker-container-terminal", baseUrl.replace(/\/$/, ""));
  wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";
  wsUrl.searchParams.set("containerId", containerId);
  wsUrl.searchParams.set("activeWay", shell);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl.toString(), {
      headers: { "x-api-key": apiKey },
    });

    ws.on("open", () => resolve(ws));
    ws.on("error", reject);
    ws.on("close", (code, reason) => {
      if (code !== 1000) reject(new Error(`WebSocket closed: ${code} ${reason}`));
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node scripts/dokploy-exec.mjs [--app backend|frontend] [--shell bash|sh]`);
    process.exit(0);
  }

  const env = loadEnv();
  const apiKey = env.DOCKPLOY_API_KEY ?? process.env.DOCKPLOY_API_KEY;
  const baseUrl = env.DOCKPLOY_URL ?? process.env.DOCKPLOY_URL;
  if (!apiKey || !baseUrl) {
    console.error("Set DOCKPLOY_API_KEY and DOCKPLOY_URL in .env.local");
    process.exit(1);
  }

  const appName =
    args.app === "frontend"
      ? env.DOCKPLOY_FRONTEND_APP_NAME
      : env.DOCKPLOY_BACKEND_APP_NAME;
  if (!appName) {
    const key = args.app === "frontend" ? "DOCKPLOY_FRONTEND_APP_NAME" : "DOCKPLOY_BACKEND_APP_NAME";
    console.error(`Set ${key} in .env.local`);
    process.exit(1);
  }

  console.error(`Resolving container for ${appName}...`);
  const containerId = await resolveContainerId(baseUrl, apiKey, appName);
  console.error(`Connecting to ${containerId} (${args.shell})...`);

  const ws = await connectTerminal({ baseUrl, apiKey, containerId, shell: args.shell });

  process.stdin.setRawMode?.(true);
  process.stdin.resume();

  ws.on("message", (data) => process.stdout.write(data));
  process.stdin.on("data", (chunk) => ws.send(chunk));
  ws.on("close", () => process.exit(0));

  process.on("SIGINT", () => {
    ws.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
