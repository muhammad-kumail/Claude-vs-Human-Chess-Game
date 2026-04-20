import { useCallback, useEffect, useRef, useState } from 'react';
import { INITIAL_BOARD, FILES } from '../engine/constants';
import { clone, isWhite } from '../engine/utils';
import {
  anyLegalMove,
  getLegalMoves,
  inCheck,
  updateCastlingRights,
} from '../engine/rules';
import { minimax } from '../engine/ai';
import { buildMoveSAN } from '../engine/san';

const INITIAL_CASTLING = { wK: true, wQ: true, bK: true, bQ: true };

export function useChessGame() {
  // phase: 'time' | 'color' | 'playing'
  const [phase, setPhase] = useState('time');

  const [board, setBoard] = useState(() => clone(INITIAL_BOARD));
  const [turn, setTurn] = useState('white');
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [lastMoveSq, setLastMoveSq] = useState(null);
  const [castlingRights, setCastlingRights] = useState(INITIAL_CASTLING);

  const [baseTime, setBaseTime] = useState(600);
  const [timeW, setTimeW] = useState(600);
  const [timeB, setTimeB] = useState(600);
  const [clockStarted, setClockStarted] = useState(false);

  const [humanColor, setHumanColor] = useState('white');
  const [aiColor, setAiColor] = useState('black');
  const flipped = humanColor === 'black';

  const [aiThinking, setAiThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMsg, setGameOverMsg] = useState('');
  const [statusMessage, setStatusMessage] = useState(
    'Choose a time control to begin',
  );

  const [pendingPromotion, setPendingPromotion] = useState(null); // { r, c, fr, fc, white, mv }
  const [pgnModalOpen, setPgnModalOpen] = useState(false);

  const [pgnMoves, setPgnMoves] = useState([]);
  const [gameResult, setGameResult] = useState('*');
  const [gameStartDate, setGameStartDate] = useState('');

  // Refs to avoid stale closures in timers / AI
  const turnRef = useRef(turn);
  const gameOverRef = useRef(gameOver);
  const timeWRef = useRef(timeW);
  const timeBRef = useRef(timeB);
  const timerRef = useRef(null);

  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { timeWRef.current = timeW; }, [timeW]);
  useEffect(() => { timeBRef.current = timeB; }, [timeB]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const doGameOver = useCallback(
    (msg, result) => {
      setGameOver(true);
      gameOverRef.current = true;
      clearTimer();
      setGameOverMsg(msg);
      setStatusMessage('Game over');
      if (result) setGameResult(result);
    },
    [clearTimer],
  );

  const startClock = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      if (gameOverRef.current) {
        clearTimer();
        return;
      }
      if (turnRef.current === 'white') {
        setTimeW((t) => {
          const next = Math.max(0, t - 1);
          if (next <= 0) doGameOver('Black wins on time!', '0-1');
          return next;
        });
      } else {
        setTimeB((t) => {
          const next = Math.max(0, t - 1);
          if (next <= 0) doGameOver('White wins on time!', '1-0');
          return next;
        });
      }
    }, 1000);
  }, [clearTimer, doGameOver]);

  const pickTime = useCallback((secs) => {
    setBaseTime(secs);
    setTimeW(secs);
    setTimeB(secs);
    setPhase('color');
  }, []);

  const resetState = useCallback(
    (humanColorPick, secs) => {
      clearTimer();
      setBoard(clone(INITIAL_BOARD));
      setTurn('white');
      setSelected(null);
      setLegalMoves([]);
      setLastMove(null);
      setLastMoveSq(null);
      setCastlingRights(INITIAL_CASTLING);
      setTimeW(secs);
      setTimeB(secs);
      setClockStarted(false);
      setAiThinking(false);
      setGameOver(false);
      gameOverRef.current = false;
      setGameOverMsg('');
      setPendingPromotion(null);
      setPgnMoves([]);
      setGameResult('*');
      setGameStartDate(
        new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      );
      setHumanColor(humanColorPick);
      setAiColor(humanColorPick === 'white' ? 'black' : 'white');
      setStatusMessage('Clock starts on first move');
      setPhase('playing');
    },
    [clearTimer],
  );

  const pickColor = useCallback(
    (color) => {
      resetState(color, baseTime);
    },
    [baseTime, resetState],
  );

  const newGame = useCallback(() => {
    clearTimer();
    setPhase('time');
    setGameOver(false);
    gameOverRef.current = false;
    setGameOverMsg('');
    setPendingPromotion(null);
    setPgnModalOpen(false);
    setStatusMessage('Choose a time control to begin');
  }, [clearTimer]);

  const checkTerminalState = useCallback(
    (nextBoard, nextCR, nextLastMove, nextTurn) => {
      const w = nextTurn === 'white';
      if (!anyLegalMove(nextBoard, w, nextCR, nextLastMove)) {
        if (inCheck(nextBoard, w)) {
          const result = w ? '0-1' : '1-0';
          doGameOver(
            'Checkmate! ' + (w ? 'Black' : 'White') + ' wins!',
            result,
          );
        } else {
          doGameOver('Stalemate — draw!', '1/2-1/2');
        }
        return true;
      }
      return false;
    },
    [doGameOver],
  );

  const computeStatus = useCallback(
    (nextBoard, nextTurn, clockOn) => {
      const w = nextTurn === 'white';
      const chk = inCheck(nextBoard, w);
      if (chk) {
        setStatusMessage((w ? 'White' : 'Black') + ' — in CHECK!');
      } else if (!clockOn) {
        setStatusMessage('Clock starts on first move');
      } else {
        setStatusMessage((w ? 'White' : 'Black') + ' to move');
      }
    },
    [],
  );

  const commitMove = useCallback(
    ({ fr, fc, mv, promoteTo = null, san = null }) => {
      const piece = board[fr][fc];
      const white = isWhite(piece);

      const recordSAN =
        san ??
        buildMoveSAN(board, fr, fc, mv, promoteTo, castlingRights, lastMove);

      const nb = clone(board);
      if (mv.enpassant) nb[fr][mv.c] = '';
      nb[mv.r][mv.c] = piece;
      nb[fr][fc] = '';
      if (mv.castleKS) {
        nb[mv.r][5] = nb[mv.r][7];
        nb[mv.r][7] = '';
      }
      if (mv.castleQS) {
        nb[mv.r][3] = nb[mv.r][0];
        nb[mv.r][0] = '';
      }
      if (promoteTo) nb[mv.r][mv.c] = promoteTo;

      const nextCR = updateCastlingRights(board, fr, fc, mv.r, mv.c, castlingRights);
      const nextLM = { r: mv.r, c: mv.c, ...mv };
      const nextTurn = white ? 'black' : 'white';

      setBoard(nb);
      setCastlingRights(nextCR);
      setLastMove(nextLM);
      setLastMoveSq({
        fr,
        fc,
        tr: mv.r,
        tc: mv.c,
        rook: mv.castleKS
          ? { fr: mv.r, fc: 7, tr: mv.r, tc: 5 }
          : mv.castleQS
            ? { fr: mv.r, fc: 0, tr: mv.r, tc: 3 }
            : null,
      });
      setSelected(null);
      setLegalMoves([]);
      setPgnMoves((prev) => [...prev, recordSAN]);
      setTurn(nextTurn);
      turnRef.current = nextTurn;

      if (!clockStarted) {
        setClockStarted(true);
        startClock();
      }

      const terminal = checkTerminalState(nb, nextCR, nextLM, nextTurn);
      if (!terminal) {
        computeStatus(nb, nextTurn, true);
      }
      return { nextTurn, terminal };
    },
    [
      board,
      castlingRights,
      lastMove,
      clockStarted,
      startClock,
      checkTerminalState,
      computeStatus,
    ],
  );

  const runAIMove = useCallback(() => {
    if (gameOverRef.current) return;
    setAiThinking(true);
    setStatusMessage('Claude is thinking…');
    setTimeout(() => {
      const aiW = aiColor === 'white';
      const res = minimax(
        board,
        3,
        -Infinity,
        Infinity,
        true,
        aiW,
        castlingRights,
        lastMove,
      );
      setAiThinking(false);
      if (!res.move) {
        doGameOver('No legal moves for Claude!', '1/2-1/2');
        return;
      }
      const { fr, fc, mv } = res.move;
      const piece = board[fr][fc];
      let promoteTo = null;
      if (piece.toLowerCase() === 'p' && (mv.r === 0 || mv.r === 7)) {
        promoteTo = aiW ? 'Q' : 'q';
      }
      commitMove({ fr, fc, mv, promoteTo });
    }, 250);
  }, [aiColor, board, castlingRights, lastMove, commitMove, doGameOver]);

  // When it's AI's turn, trigger move
  useEffect(() => {
    if (phase !== 'playing') return;
    if (gameOver) return;
    if (pendingPromotion) return;
    if (aiThinking) return;
    if (turn === aiColor) {
      const delay = clockStarted ? 400 : 600;
      const id = setTimeout(() => runAIMove(), delay);
      return () => clearTimeout(id);
    }
  }, [
    phase,
    turn,
    aiColor,
    gameOver,
    aiThinking,
    pendingPromotion,
    clockStarted,
    runAIMove,
  ]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  const onSquareClick = useCallback(
    (r, c) => {
      if (phase !== 'playing') return;
      if (pendingPromotion || gameOver || aiThinking) return;
      if (turn === aiColor) return;

      const clickedMv = legalMoves.find((m) => m.r === r && m.c === c);

      if (selected && clickedMv) {
        const fr = selected.r;
        const fc = selected.c;
        const piece = board[fr][fc];
        const white = isWhite(piece);
        const isPromo =
          piece.toLowerCase() === 'p' && (r === 0 || r === 7);

        if (isPromo) {
          // Visually move pawn to last rank, then await promotion choice.
          const nb = clone(board);
          if (clickedMv.enpassant) nb[fr][clickedMv.c] = '';
          nb[r][c] = piece;
          nb[fr][fc] = '';
          setBoard(nb);
          setLastMoveSq({ fr, fc, tr: r, tc: c });
          setSelected(null);
          setLegalMoves([]);
          setPendingPromotion({ fr, fc, r, c, white, mv: clickedMv });
          return;
        }

        commitMove({ fr, fc, mv: clickedMv });
        return;
      }

      const piece = board[r][c];
      if (!piece) {
        setSelected(null);
        setLegalMoves([]);
        return;
      }
      const isWhitePiece = isWhite(piece);
      if ((turn === 'white' && !isWhitePiece) || (turn === 'black' && isWhitePiece)) {
        setSelected(null);
        setLegalMoves([]);
        return;
      }
      setSelected({ r, c });
      setLegalMoves(getLegalMoves(board, r, c, castlingRights, lastMove));
    },
    [
      phase,
      pendingPromotion,
      gameOver,
      aiThinking,
      turn,
      aiColor,
      legalMoves,
      selected,
      board,
      castlingRights,
      lastMove,
      commitMove,
    ],
  );

  const choosePromotion = useCallback(
    (pieceChar) => {
      if (!pendingPromotion) return;
      const { fr, fc, r, c, white, mv } = pendingPromotion;

      // Manually record SAN for promotion (simple, matches original)
      const destFile = FILES[c];
      const destRank = String(8 - r);
      const isCapture = !!(mv.capture || mv.enpassant);
      let san =
        (isCapture ? FILES[fc] + 'x' : '') +
        destFile +
        destRank +
        '=' +
        pieceChar.toUpperCase();

      // Board already has pawn on promotion square; replace with chosen piece.
      const nb = clone(board);
      nb[r][c] = pieceChar;

      const nextCR = updateCastlingRights(board, fr, fc, r, c, castlingRights);
      const nextLM = { r, c, ...mv };
      if (inCheck(nb, !white)) {
        if (!anyLegalMove(nb, !white, nextCR, nextLM)) san += '#';
        else san += '+';
      }

      setPendingPromotion(null);
      setBoard(nb);
      setCastlingRights(nextCR);
      setLastMove(nextLM);
      setLastMoveSq({ fr, fc, tr: r, tc: c });
      setPgnMoves((prev) => [...prev, san]);

      const nextTurn = white ? 'black' : 'white';
      setTurn(nextTurn);
      turnRef.current = nextTurn;

      if (!clockStarted) {
        setClockStarted(true);
        startClock();
      }

      const terminal = checkTerminalState(nb, nextCR, nextLM, nextTurn);
      if (!terminal) {
        computeStatus(nb, nextTurn, true);
      }
    },
    [
      pendingPromotion,
      board,
      castlingRights,
      clockStarted,
      startClock,
      checkTerminalState,
      computeStatus,
    ],
  );

  return {
    // state
    phase,
    board,
    turn,
    selected,
    legalMoves,
    lastMoveSq,
    humanColor,
    aiColor,
    flipped,
    aiThinking,
    gameOver,
    gameOverMsg,
    statusMessage,
    pendingPromotion,
    pgnModalOpen,
    pgnMoves,
    gameResult,
    gameStartDate,
    timeW,
    timeB,
    clockStarted,
    baseTime,
    // actions
    pickTime,
    pickColor,
    newGame,
    onSquareClick,
    choosePromotion,
    openPGN: () => setPgnModalOpen(true),
    closePGN: () => setPgnModalOpen(false),
    cancelPromotion: () => {
      // Revert: nothing to revert because we didn't mutate board. Just clear state.
      setPendingPromotion(null);
      setLastMoveSq(null);
    },
  };
}
