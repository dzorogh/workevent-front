import { env } from '@/config/env';
import type { paths } from '@/lib/api/v1';
import createClient from "openapi-fetch";

const api = createClient<paths>({
  baseUrl: env.apiUrl,
})

export default api;
