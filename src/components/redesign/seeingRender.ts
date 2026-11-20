// Canvas renderings for the What we do hero ("Four ways of seeing").
// Both draw the same photograph, fitted like CSS `object-fit: cover`, so
// every lens lines up exactly with the photo underneath.

/** Where the photo lands when it covers a w×h box (centred) */
function cover(image: HTMLImageElement, w: number, h: number) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  return { x: (w - dw) / 2, y: (h - dh) / 2, w: dw, h: dh };
}

/** Sizes a canvas to its box (at most ~1600px wide) and returns its context */
function prepare(canvas: HTMLCanvasElement, maxWidth = 1600) {
  const box = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, maxWidth / Math.max(1, box.width));
  canvas.width = Math.max(1, Math.round(box.width * ratio));
  canvas.height = Math.max(1, Math.round(box.height * ratio));
  return canvas.getContext('2d', { willReadFrequently: true });
}

/**
 * Transform: the scene as an architect's ink drawing on paper. Edges are
 * found with a Sobel pass over the photo's brightness and drawn as dark ink.
 */
export function drawBlueprint(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const context = prepare(canvas, 1400);
  if (!context) return;
  const { width: w, height: h } = canvas;
  const fit = cover(image, w, h);
  context.drawImage(image, fit.x, fit.y, fit.w, fit.h);
  const input = context.getImageData(0, 0, w, h).data;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < lum.length; i++) lum[i] = input[i * 4] * .299 + input[i * 4 + 1] * .587 + input[i * 4 + 2] * .114;
  const output = context.createImageData(w, h);
  const ink = output.data;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1];
      const gy = lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1] - lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1];
      const edge = Math.hypot(gx, gy);
      const k = i * 4;
      ink[k] = 34; ink[k + 1] = 33; ink[k + 2] = 31;
      ink[k + 3] = Math.min(235, Math.max(0, edge - 34) * 1.25);
    }
  }
  context.putImageData(output, 0, 0);
}

/**
 * Intelligence: the scene as a measured data field. The photo is sampled
 * on a grid; each cell becomes a dot sized by its brightness, and a few
 * bright cells show a small figure instead, as if each point were read.
 */
export function drawDataField(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const context = prepare(canvas);
  if (!context) return;
  const { width: w, height: h } = canvas;
  const cell = Math.max(7, Math.round(w / 150));
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);

  // Sample the photo at one pixel per cell
  const sample = document.createElement('canvas');
  sample.width = cols;
  sample.height = rows;
  const sampler = sample.getContext('2d', { willReadFrequently: true });
  if (!sampler) return;
  const fit = cover(image, cols, rows);
  sampler.drawImage(image, fit.x, fit.y, fit.w, fit.h);
  const data = sampler.getImageData(0, 0, cols, rows).data;

  context.fillStyle = '#050505';
  context.fillRect(0, 0, w, h);
  context.font = `${Math.round(cell * .78)}px ui-monospace, Menlo, monospace`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const k = (row * cols + col) * 4;
      const light = (data[k] * .299 + data[k + 1] * .587 + data[k + 2] * .114) / 255;
      const cx = col * cell + cell / 2;
      const cy = row * cell + cell / 2;
      const figure = light > .5 && (col * 7 + row * 13) % 29 === 0;
      if (figure) {
        context.fillStyle = `rgba(255,255,255,${(.55 + light * .45).toFixed(2)})`;
        context.fillText(String(Math.floor(light * 99)).padStart(2, '0'), cx, cy);
      } else {
        context.fillStyle = `rgba(255,255,255,${(.18 + light * .72).toFixed(2)})`;
        context.beginPath();
        context.arc(cx, cy, Math.max(.35, light ** 1.5 * cell * .44), 0, Math.PI * 2);
        context.fill();
      }
    }
  }
  // A faint measuring grid every eight cells
  context.strokeStyle = 'rgba(255,255,255,.07)';
  context.lineWidth = 1;
  context.beginPath();
  for (let col = 0; col < cols; col += 8) { context.moveTo(col * cell + .5, 0); context.lineTo(col * cell + .5, h); }
  for (let row = 0; row < rows; row += 8) { context.moveTo(0, row * cell + .5); context.lineTo(w, row * cell + .5); }
  context.stroke();
}
