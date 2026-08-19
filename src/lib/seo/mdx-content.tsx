import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';

export async function compileMdxContent(content: string) {
  const code = String(
    await compile(content, { outputFormat: 'function-body' }),
  );

  const { default: Content } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return Content;
}
