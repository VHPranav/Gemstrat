import { readdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const directory = new URL('../public/images/presence/', import.meta.url);
const w = 384;
const h = 256;
for (const file of await readdir(directory)) {
  if (!file.endsWith('.png')) continue;
  const { data } = await sharp(new URL(file, directory).pathname)
    .resize(w, h).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const lines = [];
  for (let y = 3; y < h - 3; y += 3) {
    for (let x = 3; x < w - 3; x += 3) {
      const i = y * w + x;
      const dx = data[i + 1] - data[i - 1];
      const dy = data[i + w] - data[i - w];
      const strength = Math.hypot(dx, dy);
      if (strength > 27) {
        lines.push([x, y, Math.round(x - 4 * dy / strength), Math.round(y + 4 * dx / strength)]);
      }
    }
  }
  lines.push([0, 213, w, 213]);
  await writeFile(new URL(file.replace('.png', '-trace.json'), directory), JSON.stringify({ w, h, lines }));
}
