import { inBounds, isWhite, sameColor } from './utils';

export function rawPawn(b, r, c, lastMove) {
  const mv = [];
  const p = b[r][c];
  const w = isWhite(p);
  const dir = w ? -1 : 1;
  const startRank = w ? 6 : 1;

  if (inBounds(r + dir, c) && !b[r + dir][c]) {
    mv.push({ r: r + dir, c });
    if (r === startRank && !b[r + 2 * dir][c]) {
      mv.push({ r: r + 2 * dir, c, double: true });
    }
  }

  for (const cc of [c - 1, c + 1]) {
    if (!inBounds(r + dir, cc)) continue;
    const t = b[r + dir][cc];
    if (t && !sameColor(t, p)) mv.push({ r: r + dir, c: cc, capture: true });
  }

  if (
    lastMove?.double &&
    Math.abs(lastMove.c - c) === 1 &&
    lastMove.r === r
  ) {
    mv.push({ r: r + dir, c: lastMove.c, enpassant: true, capture: true });
  }
  return mv;
}

export function rawKnight(b, r, c) {
  const mv = [];
  const p = b[r][c];
  const deltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(nr, nc)) continue;
    const t = b[nr][nc];
    if (!t) mv.push({ r: nr, c: nc });
    else if (!sameColor(t, p)) mv.push({ r: nr, c: nc, capture: true });
  }
  return mv;
}

function slide(b, r, c, dirs) {
  const mv = [];
  const p = b[r][c];
  for (const [dr, dc] of dirs) {
    let rr = r + dr;
    let cc = c + dc;
    while (inBounds(rr, cc)) {
      const t = b[rr][cc];
      if (!t) {
        mv.push({ r: rr, c: cc });
      } else {
        if (!sameColor(t, p)) mv.push({ r: rr, c: cc, capture: true });
        break;
      }
      rr += dr;
      cc += dc;
    }
  }
  return mv;
}

export const rawRook = (b, r, c) =>
  slide(b, r, c, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
export const rawBishop = (b, r, c) =>
  slide(b, r, c, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
export const rawQueen = (b, r, c) =>
  slide(b, r, c, [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ]);

export function rawKing(b, r, c) {
  const mv = [];
  const p = b[r][c];
  const deltas = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ];
  for (const [dr, dc] of deltas) {
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(nr, nc)) continue;
    const t = b[nr][nc];
    if (!t) mv.push({ r: nr, c: nc });
    else if (!sameColor(t, p)) mv.push({ r: nr, c: nc, capture: true });
  }
  return mv;
}

export function rawMoves(b, r, c, lastMove) {
  const p = b[r][c];
  if (!p) return [];
  const t = p.toLowerCase();
  if (t === 'p') return rawPawn(b, r, c, lastMove);
  if (t === 'n') return rawKnight(b, r, c);
  if (t === 'r') return rawRook(b, r, c);
  if (t === 'b') return rawBishop(b, r, c);
  if (t === 'q') return rawQueen(b, r, c);
  if (t === 'k') return rawKing(b, r, c);
  return [];
}

/*
 * moves.js — Pseudo-legal move generation (ignores check).
 *
 * Builds candidate destinations per piece type: pawns (push, double, capture,
 * en passant using lastMove), knights, sliding pieces, king steps, and
 * rawMoves() dispatch. Legal filtering and castling live in rules.js.
 */
