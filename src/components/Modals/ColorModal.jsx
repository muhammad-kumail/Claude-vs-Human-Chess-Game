import './Modal.css';

export default function ColorModal({ onPick }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>Choose Your Side</h2>
        <p>You're always at the bottom. Claude is always at the top.</p>
        <div className="btn-grid">
          <button className="pick-btn" onClick={() => onPick('white')}>
            ♙ Play as White
            <small>You go first</small>
          </button>
          <button className="pick-btn" onClick={() => onPick('black')}>
            ♟ Play as Black
            <small>Claude goes first</small>
          </button>
        </div>
      </div>
    </div>
  );
}
