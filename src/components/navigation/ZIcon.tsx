import { S_PIECE_SHADES, S_PIECES } from '@/lib/heroObject';

// ---------------------------------------------------------------------------
// ZIcon / ZPieceGlyph
// The logo's mark as flat SVG: the wordmark's S (lib/heroObject's
// S_PIECES), the way round it is in the logo (the hero's 3D logo is the
// mirrored Z; the menu shows the S). White pieces take currentColor (so the
// icon flips with the navbar over light sections); the diagonal keeps its
// grey.
// ---------------------------------------------------------------------------

const MIN_X = 70.948;
const MAX_X = 94.151;
const HEIGHT = 23.879;

const points = (piece: [number, number][]) => piece.map(([x, y]) => `${x},${y}`).join(' ');
const fillOf = (part: number) => (S_PIECE_SHADES[part].toLowerCase() === '#ffffff' ? 'currentColor' : S_PIECE_SHADES[part]);

// Each piece's nudge outward (in the S's own units), used
// for the hover hint on the menu button: the S eases apart a little
const DIAGONAL = 3; // S_PIECES index of the diagonal
const NUDGE: [number, number][] = [
  [0, -1.6], // top bar
  [0, 1.6], // bottom bar
  [-1.6, 0], // left stub
  [0, 0], // diagonal
  [1.6, 0], // right stub
];

export function ZIcon({ className = '', apart = false }: { className?: string; apart?: boolean }) {
  return (
    <svg
      viewBox={`${MIN_X - 2} -2 ${MAX_X - MIN_X + 4} ${HEIGHT + 4}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g>
        {S_PIECES.map((piece, i) => (
          <polygon
            key={i}
            points={points(piece)}
            fill={fillOf(i)}
            // Straight pieces snap to whole pixels so they stay sharp at icon
            // size; the diagonal stays smoothly anti-aliased
            shapeRendering={i === DIAGONAL ? 'geometricPrecision' : 'crispEdges'}
            className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: apart ? `translate(${NUDGE[i][0]}px, ${NUDGE[i][1]}px)` : 'none' }}
          />
        ))}
      </g>
    </svg>
  );
}

/** One piece of the S on its own, fitted to its box */
export function ZPieceGlyph({ part, className = '' }: { part: number; className?: string }) {
  const xs = S_PIECES[part].map(([x]) => x);
  const ys = S_PIECES[part].map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={points(S_PIECES[part])} fill={fillOf(part)} />
    </svg>
  );
}
