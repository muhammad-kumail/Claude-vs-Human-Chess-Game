import { findKing } from '../../engine/utils';
import { inCheck } from '../../engine/rules';
import Square from './Square';
import './Board.css';

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

      squares.push(
        <Square
          key={`${sr}-${sc}`}
          r={r}
          c={c}
          piece={board[r][c]}
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
        <div className="board-grid">{squares}</div>
        <div className="file-labels">
          {fileChars.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
