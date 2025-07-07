import { env } from '@/config/env';
import type { paths } from '@/lib/api/v1';
import createClient from "openapi-fetch";

const client = createClient<paths>({
  baseUrl: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  cache: 'force-cache'
});

// Добавляем middleware для обработки ошибок
client.use({
  async onResponse({ response }) {
    // Проверяем, что ответ действительно JSON
    const contentType = response.headers.get('content-type');

    // Если ответ не успешный, проверяем тип контента
    if (!contentType?.includes('application/json')) {
      // Если это не JSON, создаем ошибку с информативным сообщением
      const text = await response.text();
      console.error('Server returned non-JSON response:', {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        contentType,
        body: text.substring(0, 200) // Первые 200 символов для отладки
      });

      // Возвращаем ошибку в формате JSON
      return new Response(JSON.stringify({
        error: 'Server error',
        message: `Server returned ${response.status} with non-JSON response`,
        status: response.status
      }), {
        status: response.status,
        headers: { 'content-type': 'application/json' }
      });
    }

    return response;
  }
});

export const Api = client;
