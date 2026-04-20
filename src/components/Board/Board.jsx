import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { PIECE_IMAGES } from '../../engine/constants';
import { findKing } from '../../engine/utils';
import { inCheck } from '../../engine/rules';
import Square from './Square';
import './Board.css';

const SQ = 66;
const MOVE_MS = 180;

export default function Board({
  board,
  turn,
  flipped,
  selected,
  legalMoves,
  lastMoveSq,
  aiThinking,
  aiColor,
  onSquareClick,
}) {
  const rankNums = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const fileChars = flipped
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const isWhiteTurn = turn === 'white';
  const kingPos = findKing(board, isWhiteTurn);
  const isInCheck = inCheck(board, isWhiteTurn);

  const aiKingPos = aiThinking ? findKing(board, aiColor === 'white') : null;

  const [anims, setAnims] = useState([]);
  const prevLastMoveKeyRef = useRef(null);
  const animTimeoutRef = useRef(null);

  const boardToScreen = useMemo(
    () => (r, c) => (flipped ? { sr: 7 - r, sc: 7 - c } : { sr: r, sc: c }),
    [flipped],
  );

  useLayoutEffect(() => {
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }

    if (!lastMoveSq) {
      prevLastMoveKeyRef.current = null;
      setAnims([]);
      return;
    }

    const key = `${lastMoveSq.fr},${lastMoveSq.fc}->${lastMoveSq.tr},${lastMoveSq.tc}`;
    if (prevLastMoveKeyRef.current === key) return;
    prevLastMoveKeyRef.current = key;

    const nextAnims = [];

    const movedPiece = board?.[lastMoveSq.tr]?.[lastMoveSq.tc];
    if (movedPiece) {
      const from = boardToScreen(lastMoveSq.fr, lastMoveSq.fc);
      const to = boardToScreen(lastMoveSq.tr, lastMoveSq.tc);
      nextAnims.push({
        piece: movedPiece,
        from,
        to,
        toBoard: { r: lastMoveSq.tr, c: lastMoveSq.tc },
        phase: 'from',
        key: `main:${key}:${Date.now()}`,
      });
    }

    const rookMove = lastMoveSq.rook;
    if (rookMove) {
      const rookPiece = board?.[rookMove.tr]?.[rookMove.tc];
      if (rookPiece) {
        const from = boardToScreen(rookMove.fr, rookMove.fc);
        const to = boardToScreen(rookMove.tr, rookMove.tc);
        nextAnims.push({
          piece: rookPiece,
          from,
          to,
          toBoard: { r: rookMove.tr, c: rookMove.tc },
          phase: 'from',
          key: `rook:${key}:${Date.now()}`,
        });
      }
    }

    if (nextAnims.length === 0) return;

    setAnims(nextAnims);

    const raf = requestAnimationFrame(() => {
      setAnims((prev) => prev.map((a) => ({ ...a, phase: 'to' })));
    });

    animTimeoutRef.current = setTimeout(() => setAnims([]), MOVE_MS + 30);

    return () => {
      cancelAnimationFrame(raf);
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current);
        animTimeoutRef.current = null;
      }
    };
  }, [lastMoveSq, board, boardToScreen]);

  const screenToBoard = (sr, sc) =>
    flipped ? { r: 7 - sr, c: 7 - sc } : { r: sr, c: sc };

  const squares = [];
  for (let sr = 0; sr < 8; sr++) {
    for (let sc = 0; sc < 8; sc++) {
      const { r, c } = screenToBoard(sr, sc);
      const mv = legalMoves.find((m) => m.r === r && m.c === c);
      const isFrom =
        lastMoveSq && r === lastMoveSq.fr && c === lastMoveSq.fc;
      const isTo =
        lastMoveSq && r === lastMoveSq.tr && c === lastMoveSq.tc;
      const isSel = selected && selected.r === r && selected.c === c;
      const showCheckRed =
        isInCheck && kingPos && kingPos.r === r && kingPos.c === c;
      const showDot =
        aiKingPos && aiKingPos.r === r && aiKingPos.c === c;
      const hidePiece = anims.some((a) => a.toBoard.r === r && a.toBoard.c === c);

      squares.push(
        <Square
          key={`${sr}-${sc}`}
          r={r}
          c={c}
          piece={board[r][c]}
          hidePiece={hidePiece}
          isLight={(r + c) % 2 === 0}
          isFrom={isFrom}
          isTo={isTo}
          isSelected={isSel}
          isInCheck={showCheckRed}
          isHighlight={mv && !mv.capture && !mv.enpassant}
          isCapture={mv && (mv.capture || mv.enpassant)}
          showThinkingDot={showDot}
          onClick={onSquareClick}
        />,
      );
    }
  }

  return (
    <div className="board-wrap">
      <div className="rank-labels">
        {rankNums.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div>
        <div className="board-area">
          <div className="board-grid">{squares}</div>
          {anims.map((a) => (
            <img
              key={a.key}
              className="moving-piece"
              src={PIECE_IMAGES[a.piece]}
              alt={a.piece}
              style={{
                transform:
                  a.phase === 'to'
                    ? `translate(${a.to.sc * SQ}px, ${a.to.sr * SQ}px)`
                    : `translate(${a.from.sc * SQ}px, ${a.from.sr * SQ}px)`,
                transition: `transform ${MOVE_MS}ms ease-in-out`,
              }}
            />
          ))}
        </div>
        <div className="file-labels">
          {fileChars.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
