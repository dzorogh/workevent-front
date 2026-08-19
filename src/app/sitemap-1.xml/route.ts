export function GET() {
  return new Response('Gone', {
    status: 410,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
