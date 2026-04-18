import { useChessGame } from './hooks/useChessGame';
import Board from './components/Board/Board';
import PlayerBar from './components/PlayerBar/PlayerBar';
import StatusBar from './components/StatusBar/StatusBar';
import TimeModal from './components/Modals/TimeModal';
import ColorModal from './components/Modals/ColorModal';
import PromotionModal from './components/Modals/PromotionModal';
import PGNModal from './components/Modals/PGNModal';
import { buildPGN } from './engine/san';

export default function App() {
  const game = useChessGame();

  const claudeTime = game.aiColor === 'white' ? game.timeW : game.timeB;
  const youTime = game.humanColor === 'white' ? game.timeW : game.timeB;
  const claudeActive =
    !game.gameOver && game.clockStarted && game.turn === game.aiColor;
  const youActive =
    !game.gameOver && game.clockStarted && game.turn === game.humanColor;
  const barsIdle = !game.clockStarted || game.gameOver;

  const claudeLabel =
    game.phase === 'playing'
      ? `Claude • ${game.aiColor === 'white' ? 'White' : 'Black'}`
      : '—';
  const youLabel =
    game.phase === 'playing'
      ? `You • ${game.humanColor === 'white' ? 'White' : 'Black'}`
      : '—';

  const pgnText = buildPGN({
    pgnMoves: game.pgnMoves,
    humanColor: game.humanColor,
    gameResult: game.gameResult,
    gameStartDate: game.gameStartDate,
  });

  return (
    <>
      <PlayerBar
        position="top"
        avatar="🤖"
        name="Claude"
        label={claudeLabel}
        time={claudeTime}
        active={claudeActive}
        idle={barsIdle}
      />

      <Board
        board={game.board}
        turn={game.turn}
        flipped={game.flipped}
        selected={game.selected}
        legalMoves={game.legalMoves}
        lastMoveSq={game.lastMoveSq}
        aiThinking={game.aiThinking}
        aiColor={game.aiColor}
        onSquareClick={game.onSquareClick}
      />

      <PlayerBar
        position="bottom"
        avatar="👤"
        name="You"
        label={youLabel}
        time={youTime}
        active={youActive}
        idle={barsIdle}
      />

      <StatusBar
        statusMessage={game.statusMessage}
        gameOver={game.gameOver}
        gameOverMsg={game.gameOverMsg}
        onNewGame={game.newGame}
        onShowPGN={game.openPGN}
      />

      {game.phase === 'time' && <TimeModal onPick={game.pickTime} />}
      {game.phase === 'color' && <ColorModal onPick={game.pickColor} />}
      {game.pendingPromotion && (
        <PromotionModal
          white={game.pendingPromotion.white}
          onChoose={game.choosePromotion}
        />
      )}
      {game.pgnModalOpen && (
        <PGNModal pgnText={pgnText} onClose={game.closePGN} />
      )}
    </>
  );
}
