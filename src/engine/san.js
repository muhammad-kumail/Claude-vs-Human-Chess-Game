import { FILES } from './constants';
import { anyLegalMove, applyMove, getLegalMoves, inCheck } from './rules';
import { sameColor } from './utils';

export function toSAN(b, fr, fc, mv, isCapture, promoteTo, castlingRights, lastMove) {
  if (mv.castleKS) return 'O-O';
  if (mv.castleQS) return 'O-O-O';

  const piece = b[fr][fc];
  const pt = piece.toLowerCase();
  const destFile = FILES[mv.c];
  const destRank = String(8 - mv.r);

  let san = '';
  if (pt === 'p') {
    if (isCapture || mv.enpassant) san = FILES[fc] + 'x';
    san += destFile + destRank;
    if (promoteTo) san += '=' + promoteTo.toUpperCase();
  } else {
    const pChar = piece.toUpperCase();
    let ambigFile = false;
    let ambigRank = false;
    for (let rr = 0; rr < 8; rr++) {
      for (let cc = 0; cc < 8; cc++) {
        if (rr === fr && cc === fc) continue;
        if (b[rr][cc] !== piece) continue;
        const mvs = getLegalMoves(b, rr, cc, castlingRights, lastMove);
        if (mvs.some((m) => m.r === mv.r && m.c === mv.c)) {
          if (cc === fc) ambigRank = true;
          else ambigFile = true;
        }
      }
    }
    san = pChar;
    if (ambigFile || ambigRank) {
      if (ambigFile && ambigRank) san += FILES[fc] + String(8 - fr);
      else if (ambigFile) san += String(8 - fr);
      else san += FILES[fc];
    }
    if (isCapture) san += 'x';
    san += destFile + destRank;
  }
  return san;
}

export function addCheckSuffix(san, nb, nextTurnWhite, castlingRights, lastMove) {
  if (inCheck(nb, nextTurnWhite)) {
    if (!anyLegalMove(nb, nextTurnWhite, castlingRights, lastMove)) san += '#';
    else san += '+';
  }
  return san;
}

export function buildMoveSAN(
  board,
  fr,
  fc,
  mv,
  promoteTo,
  castlingRights,
  lastMove,
) {
  const piece = board[fr][fc];
  const target = board[mv.r][mv.c];
  const hasCapture = !!(target && !sameColor(target, piece));

  let san = toSAN(board, fr, fc, mv, hasCapture, promoteTo, castlingRights, lastMove);

  let nb = applyMove(board, fr, fc, mv);
  if (promoteTo) nb[mv.r][mv.c] = promoteTo;

  const movedWhite = piece === piece.toUpperCase();
  const nextIsWhite = !movedWhite;
  const nextLastMove = { r: mv.r, c: mv.c, ...mv };
  san = addCheckSuffix(san, nb, nextIsWhite, castlingRights, nextLastMove);
  return san;
}

export function buildPGN({
  pgnMoves,
  humanColor,
  gameResult,
  gameStartDate,
}) {
  const white = humanColor === 'white' ? 'Human' : 'Claude';
  const black = humanColor === 'black' ? 'Human' : 'Claude';
  const date =
    gameStartDate ||
    new Date().toISOString().split('T')[0].replace(/-/g, '.');
  let pgn = '[Event "Claude vs Human"]\n';
  pgn += '[Site "claude.ai"]\n';
  pgn += '[Date "' + date + '"]\n';
  pgn += '[White "' + white + '"]\n';
  pgn += '[Black "' + black + '"]\n';
  pgn += '[Result "' + gameResult + '"]\n\n';

  let moveText = '';
  for (let i = 0; i < pgnMoves.length; i++) {
    if (i % 2 === 0) moveText += String(Math.floor(i / 2) + 1) + '. ';
    moveText += pgnMoves[i] + ' ';
    if (i % 2 === 1) moveText = moveText.trimEnd() + ' ';
  }

  const words = moveText.trim().split(' ');
  let line = '';
  let result = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 78) {
      result += line.trim() + '\n';
      line = w;
    } else {
      line = (line ? line + ' ' : '') + w;
    }
  }
  if (line) result += line.trim();
  pgn += result + ' ' + gameResult;
  return pgn;
}
