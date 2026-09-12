import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const out = new URL('../tmp/discovery-compare/', import.meta.url);
mkdirSync(out, { recursive: true });

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const actual = new URL('actual-1536.png', out).pathname;
const ref = new URL('../docs/superpowers/specs/01-discovery.png', import.meta.url).pathname;

execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1536,1024',
  '--virtual-time-budget=10000',
  `--screenshot=${actual}`,
  'http://localhost:3000/dev/discovery',
], { stdio: 'inherit' });

execFileSync('python3', ['-c', `
from PIL import Image, ImageChops, ImageEnhance, ImageStat
ref = Image.open(${JSON.stringify(ref)}).convert('RGB')
act = Image.open(${JSON.stringify(actual)}).convert('RGB')
Image.blend(ref, act, 0.5).save(${JSON.stringify(new URL('overlay-50.png', out).pathname)})
diff = ImageChops.difference(ref, act)
diff.save(${JSON.stringify(new URL('diff.png', out).pathname)})
ImageEnhance.Brightness(diff).enhance(5).save(${JSON.stringify(new URL('diff-amp.png', out).pathname)})
print('overlay/diff written', ref.size, act.size)
for name,y0,y1 in [('header',0,80),('hero',80,280),('search',280,360),('chips',360,440),('cards',490,860),('sub',880,1024)]:
    d = ImageChops.difference(ref.crop((0,y0,1536,y1)), act.crop((0,y0,1536,y1)))
    print(f'{name:8} mean={sum(ImageStat.Stat(d).mean)/3:5.1f}')
`])
