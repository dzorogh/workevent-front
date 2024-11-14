import { env } from '@/config/env';
import createFetchClient from 'openapi-fetch';
import type { paths } from '@/lib/api/v1';
import createClient from "openapi-fetch";


interface Api {
  baseUrl: string;
  getFullUrl: (path: string) => string;
  fetchClient: ReturnType<typeof createFetchClient<paths>>;
}

export const api: Api = {
  baseUrl: env.apiUrl,
  
  getFullUrl: (path: string) => {
    return `${env.apiUrl}${path}`;
  },

  fetchClient: createClient<paths>({
    baseUrl: env.apiUrl,
  })
}; 
