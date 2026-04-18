import { PIECE_IMAGES } from '../../engine/constants';
import './Modal.css';

const NAMES = { Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight' };

export default function PromotionModal({ white, onChoose }) {
  const opts = white ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
  return (
    <div className="overlay">
      <div className="panel">
        <h2>Promote Pawn</h2>
        <div className="promo-choices">
          {opts.map((p) => (
            <div
              key={p}
              className="choice"
              onClick={() => onChoose(p)}
            >
              <img src={PIECE_IMAGES[p]} alt={p} />
              <div>{NAMES[p.toUpperCase()]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
