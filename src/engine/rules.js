import { clone, findKing, isWhite } from './utils';
import {
  rawBishop,
  rawKing,
  rawKnight,
  rawMoves,
  rawQueen,
  rawRook,
} from './moves';

export function attacked(b, r, c, byWhite) {
  for (let rr = 0; rr < 8; rr++) {
    for (let cc = 0; cc < 8; cc++) {
      const p = b[rr][cc];
      if (!p || isWhite(p) !== byWhite) continue;
      const t = p.toLowerCase();
      if (t === 'p') {
        const d = byWhite ? -1 : 1;
        if (rr + d === r && (cc - 1 === c || cc + 1 === c)) return true;
      } else {
        const mv =
          t === 'n' ? rawKnight(b, rr, cc)
          : t === 'r' ? rawRook(b, rr, cc)
          : t === 'b' ? rawBishop(b, rr, cc)
          : t === 'q' ? rawQueen(b, rr, cc)
          : t === 'k' ? rawKing(b, rr, cc)
          : [];
        if (mv.some((m) => m.r === r && m.c === c)) return true;
      }
    }
  }
  return false;
}

export function inCheck(b, white) {
  const kp = findKing(b, white);
  return kp && attacked(b, kp.r, kp.c, !white);
}

export function checkerCount(b, white) {
  const kp = findKing(b, white);
  if (!kp) return 0;
  let n = 0;
  for (let rr = 0; rr < 8; rr++) {
    for (let cc = 0; cc < 8; cc++) {
      const p = b[rr][cc];
      if (!p || isWhite(p) === white) continue;
      const t = p.toLowerCase();
      let mv = [];
      if (t === 'p') {
        const d = isWhite(p) ? -1 : 1;
        if (rr + d === kp.r && (cc - 1 === kp.c || cc + 1 === kp.c)) {
          mv.push({ r: kp.r, c: kp.c });
        }
      } else {
        mv =
          t === 'n' ? rawKnight(b, rr, cc)
          : t === 'r' ? rawRook(b, rr, cc)
          : t === 'b' ? rawBishop(b, rr, cc)
          : t === 'q' ? rawQueen(b, rr, cc)
          : t === 'k' ? rawKing(b, rr, cc)
          : [];
      }
      if (mv.some((m) => m.r === kp.r && m.c === kp.c)) n++;
    }
  }
  return n;
}

export function applyMove(b, fr, fc, mv) {
  const nb = clone(b);
  const p = nb[fr][fc];
  if (mv.enpassant) nb[fr][mv.c] = '';
  nb[mv.r][mv.c] = p;
  nb[fr][fc] = '';
  if (mv.castleKS) {
    nb[mv.r][5] = nb[mv.r][7];
    nb[mv.r][7] = '';
  }
  if (mv.castleQS) {
    nb[mv.r][3] = nb[mv.r][0];
    nb[mv.r][0] = '';
  }
  return nb;
}

export function leavesCheck(b, fr, fc, mv) {
  return inCheck(applyMove(b, fr, fc, mv), isWhite(b[fr][fc]));
}

export function castleMoves(b, r, c, cr) {
  const mv = [];
  const w = isWhite(b[r][c]);
  const row = w ? 7 : 0;
  if (r !== row || c !== 4) return mv;
  const ks = w ? 'wK' : 'bK';
  const qs = w ? 'wQ' : 'bQ';
  if (
    cr[ks] &&
    !b[row][5] &&
    !b[row][6] &&
    !inCheck(b, w) &&
    !attacked(b, row, 5, !w) &&
    !attacked(b, row, 6, !w)
  ) {
    mv.push({ r: row, c: 6, castleKS: true });
  }
  if (
    cr[qs] &&
    !b[row][3] &&
    !b[row][2] &&
    !b[row][1] &&
    !inCheck(b, w) &&
    !attacked(b, row, 3, !w) &&
    !attacked(b, row, 2, !w)
  ) {
    mv.push({ r: row, c: 2, castleQS: true });
  }
  return mv;
}

export function getLegalMoves(b, r, c, cr, lastMove) {
  const p = b[r][c];
  if (!p) return [];
  const w = isWhite(p);
  const isKing = p.toLowerCase() === 'k';
  const chk = checkerCount(b, w);
  if (chk >= 2 && !isKing) return [];
  let cands = rawMoves(b, r, c, lastMove);
  if (isKing) cands = [...cands, ...castleMoves(b, r, c, cr)];
  return cands.filter((m) => !leavesCheck(b, r, c, m));
}

export function anyLegalMove(b, white, cr, lastMove) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p || isWhite(p) !== white) continue;
      if (getLegalMoves(b, r, c, cr, lastMove).length > 0) return true;
    }
  }
  return false;
}

export function updateCastlingRights(board, fr, fc, tr, tc, cr) {
  const p = board[fr][fc];
  const ncr = { ...cr };
  if (p === 'K') { ncr.wK = false; ncr.wQ = false; }
  if (p === 'k') { ncr.bK = false; ncr.bQ = false; }
  if (p === 'R') {
    if (fr === 7 && fc === 7) ncr.wK = false;
    if (fr === 7 && fc === 0) ncr.wQ = false;
  }
  if (p === 'r') {
    if (fr === 0 && fc === 7) ncr.bK = false;
    if (fr === 0 && fc === 0) ncr.bQ = false;
  }
  if (tr === 7 && tc === 7) ncr.wK = false;
  if (tr === 7 && tc === 0) ncr.wQ = false;
  if (tr === 0 && tc === 7) ncr.bK = false;
  if (tr === 0 && tc === 0) ncr.bQ = false;
  return ncr;
}
