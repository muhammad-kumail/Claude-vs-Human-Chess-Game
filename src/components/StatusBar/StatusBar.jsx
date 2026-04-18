import './StatusBar.css';

export default function StatusBar({
  statusMessage,
  gameOver,
  gameOverMsg,
  onNewGame,
  onShowPGN,
}) {
  return (
    <>
      <div className="status-bar">{statusMessage}</div>
      {gameOver && <div className="game-over">{gameOverMsg}</div>}
      {gameOver && (
        <div className="btn-row">
          <button className="pgn-btn" onClick={onShowPGN}>
            PGN
          </button>
          <button className="reset-btn" onClick={onNewGame}>
            New Game
          </button>
        </div>
      )}
    </>
  );
}
