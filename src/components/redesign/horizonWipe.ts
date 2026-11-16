const clamp = (value: number) => Math.max(0, Math.min(1, value));

// The same uneven pixel frontier as the Theory transition. The outgoing
// hero already has a white background, so the canvas only draws the letters.
export function drawHorizonWipe(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, width: number, height: number, progress: number) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const cell = width < 640 ? 6 : 8;
  const band = height * .14;
  const edge = height + band - progress * (height + band * 2);
  let titleMask = '';
  context.font = `${cell * .65}px monospace`;
  context.textAlign = 'center';
  const letters = 'FIVEREGIONSONEWAYOFWORKING';
  for (let column = 0; column * cell < width; column++) {
    const x = column * cell;
    const position = x / width;
    // Overlapping waves give the frontier unequal peaks and troughs.
    // The envelope settles both endpoints and stays reversible on scroll.
    const wave = Math.sin(position * Math.PI * 2.3 + .4) * .09
      + Math.sin(position * Math.PI * 5.7 + 1.8) * .045
      + Math.sin(position * Math.PI * 10.1 + .7) * .018;
    const columnEdge = edge + height * wave * Math.sin(progress * Math.PI);
    const top = Math.max(0, Math.floor((columnEdge - band) / cell) * cell);
    titleMask += `M${x} 0h${cell + .5}v${top}h${-cell - .5}Z`;
    for (let row = top / cell; row * cell < Math.min(height, columnEdge + band); row++) {
      const seed = Math.sin(column * 127.1 + row * 311.7) * 43758.5453;
      const noise = seed - Math.floor(seed);
      const coverage = clamp((columnEdge + band * (noise - .5) - row * cell) / cell);
      if (coverage > .45) {
        titleMask += `M${x} ${row * cell}h${cell + .5}v${cell + .5}h${-cell - .5}Z`;
      }
      if (Math.abs(row * cell - columnEdge) < band * .65 && noise > .72) {
        context.fillStyle = coverage > .45 ? '#777' : '#aaa';
        context.fillText(letters[(row + column) % letters.length], (column + .5) * cell, (row + .8) * cell);
      }
    }
  }
  return `path('${titleMask}')`;
}
