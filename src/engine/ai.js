import { PIECE_SQUARE_TABLES, PIECE_VALUES } from './constants';
import { isWhite } from './utils';
import {
  applyMove,
  getLegalMoves,
  inCheck,
  updateCastlingRights,
} from './rules';

export function evaluateBoard(b, whitePerspective) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p) continue;
      const t = p.toLowerCase();
      const w = isWhite(p);
      const base = PIECE_VALUES[t] || 0;
      const idx = w ? r * 8 + c : (7 - r) * 8 + c;
      const pos = (PIECE_SQUARE_TABLES[t] || [])[idx] || 0;
      score += (w ? 1 : -1) * (base + pos);
    }
  }
  return whitePerspective ? score : -score;
}

export function minimax(b, depth, alpha, beta, maximizing, whitePerspective, cr, lastMove) {
  if (depth === 0) return { score: evaluateBoard(b, whitePerspective) };

  const curWhite = maximizing === whitePerspective;
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p || isWhite(p) !== curWhite) continue;
      const mvs = getLegalMoves(b, r, c, cr, lastMove);
      for (const m of mvs) allMoves.push({ fr: r, fc: c, mv: m });
    }
  }

  if (allMoves.length === 0) {
    return {
      score: inCheck(b, curWhite) ? (maximizing ? -99999 : 99999) : 0,
    };
  }

  let best = maximizing ? -Infinity : Infinity;
  let bestMove = null;

  for (const { fr, fc, mv } of allMoves) {
    const nb = applyMove(b, fr, fc, mv);
    if (
      nb[mv.r][mv.c] &&
      nb[mv.r][mv.c].toLowerCase() === 'p' &&
      (mv.r === 0 || mv.r === 7)
    ) {
      nb[mv.r][mv.c] = isWhite(b[fr][fc]) ? 'Q' : 'q';
    }
    const ncr = updateCastlingRights(b, fr, fc, mv.r, mv.c, cr);
    const res = minimax(
      nb,
      depth - 1,
      alpha,
      beta,
      !maximizing,
      whitePerspective,
      ncr,
      { r: mv.r, c: mv.c, ...mv },
    );
    if (maximizing) {
      if (res.score > best) { best = res.score; bestMove = { fr, fc, mv }; }
      alpha = Math.max(alpha, best);
    } else {
      if (res.score < best) { best = res.score; bestMove = { fr, fc, mv }; }
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return { score: best, move: bestMove };
}
