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

export function ZIcon({ className = '' }: { className?: string }) {
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
