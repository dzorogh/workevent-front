import { env } from '@/config/env';
import type { paths } from '@/lib/api/v1';
import createClient from "openapi-fetch";

export const Api = createClient<paths>({
  baseUrl: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  cache: 'force-cache'
})
