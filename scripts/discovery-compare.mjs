import { spawnSync } from 'node:child_process';
import { mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'tmp/discovery-compare');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const reference = join(root, 'docs/superpowers/specs/01-discovery.png');

mkdirSync(outDir, { recursive: true });

function shot({ url, file, width, height }) {
  const tmp = join(outDir, `chrome-${width}.png`);
  const result = spawnSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    '--virtual-time-budget=8000',
    '--run-all-compositor-stages-before-draw',
    `--screenshot=${tmp}`,
    url,
  ], { encoding: 'utf8' });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'chrome screenshot failed');
  }
  copyFileSync(tmp, file);
}

const desktop = join(outDir, 'actual-1536.png');
shot({
  url: 'http://localhost:3000/dev/discovery',
  file: desktop,
  width: 1536,
  height: 1024,
});

const mobile = join(outDir, 'actual-390.png');
shot({
  url: 'http://localhost:3000/dev/discovery',
  file: mobile,
  width: 390,
  height: 844,
});

const tablet = join(outDir, 'actual-768.png');
shot({
  url: 'http://localhost:3000/dev/discovery',
  file: tablet,
  width: 768,
  height: 1024,
});

const mid = join(outDir, 'actual-1280.png');
shot({
  url: 'http://localhost:3000/dev/discovery',
  file: mid,
  width: 1280,
  height: 900,
});

const py = `
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat
import os

ref = Image.open(${JSON.stringify(reference)}).convert('RGB')
act = Image.open(${JSON.stringify(desktop)}).convert('RGB')
print('ref', ref.size, 'act', act.size)
if act.size != ref.size:
    act = act.resize(ref.size, Image.Resampling.LANCZOS)
    print('resized act', act.size)

overlay = Image.blend(ref, act, 0.5)
overlay.save(${JSON.stringify(join(outDir, 'overlay-50.png'))})

diff = ImageChops.difference(ref, act)
diff.save(${JSON.stringify(join(outDir, 'diff.png'))})

# emphasize diffs
amp = diff.point(lambda p: min(255, p * 4))
amp.save(${JSON.stringify(join(outDir, 'diff-amplified.png'))})

stat = ImageStat.Stat(diff)
mean = sum(stat.mean) / 3
print('mean_abs_diff', round(mean, 2))

# sample control points
pxr, pxa = ref.load(), act.load()
points = {
  'content_left': (84, 200),
  'h1': (84, 120),
  'search': (84, 320),
  'chip': (84, 388),
  'card1': (84, 600),
  'card2': (547, 600),
  'card3': (1008, 600),
  'subscribe': (32, 940),
}
for name, (x,y) in points.items():
    print(name, 'ref', pxr[x,y], 'act', pxa[x,y])
`

const pyResult = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
process.stdout.write(pyResult.stdout);
process.stderr.write(pyResult.stderr);
if (pyResult.status !== 0) {
  process.exit(pyResult.status ?? 1);
}

console.log('wrote', outDir);
