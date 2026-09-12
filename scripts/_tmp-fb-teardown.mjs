import { readFileSync, rmSync } from 'node:fs'

function loadEnv(path) {
  const env = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const dokploy = loadEnv('/Users/dzorogh/Develop/workevent/workevent-front/.env.local')
const baseUrl = dokploy.DOCKPLOY_URL.replace(/\/$/, '')
const apiKey = dokploy.DOCKPLOY_API_KEY
const composeId = '3Cwd5417eUyVZ6z53dLhb'
const projectId = 'qODE-VoObX5ghWfvrKx9F'

async function dokployFetch(path, init) {
  const res = await fetch(`${baseUrl}/api/${path}`, {
    headers: {
      'x-api-key': apiKey,
      accept: 'application/json',
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
    },
    ...init,
  })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = { raw: text.slice(0, 200) }
  }
  return { status: res.status, json }
}

const stopped = await dokployFetch('compose.stop', {
  method: 'POST',
  body: JSON.stringify({ composeId }),
})
console.log('compose.stop', stopped.status)

const deleted = await dokployFetch('compose.delete', {
  method: 'POST',
  body: JSON.stringify({ composeId, deleteVolumes: true }),
})
console.log('compose.delete', deleted.status)

const removed = await dokployFetch('project.remove', {
  method: 'POST',
  body: JSON.stringify({ projectId }),
})
console.log('project.remove', removed.status, removed.status >= 400 ? Object.keys(removed.json) : 'ok')

let personal
try {
  personal = loadEnv('/Users/dzorogh/Documents/personal/.env')
} catch {
  personal = {}
}
const cfToken = personal.CLAUDFLARE_DNS_TOKEN || personal.CLOUDFLARE_DNS_TOKEN || personal.CLOUDFLARE_API_TOKEN
const zoneId = '540be7e2ac12234792c0c8a45e8397b5'
if (cfToken) {
  const list = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=formbricks.oryxbms.com`,
    { headers: { authorization: `Bearer ${cfToken}`, accept: 'application/json' } },
  )
  const listJson = await list.json()
  const records = listJson.result || []
  console.log('cf_records', records.map((r) => ({ id: r.id, type: r.type, name: r.name })))
  for (const rec of records) {
    const del = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${rec.id}`,
      {
        method: 'DELETE',
        headers: { authorization: `Bearer ${cfToken}`, accept: 'application/json' },
      },
    )
    console.log('cf_delete', rec.id, del.status)
  }
} else {
  console.log('cf_skip_no_token')
}

rmSync('/Users/dzorogh/.config/formbricks', { recursive: true, force: true })
console.log('local_config_removed')
