import { TIME_CONTROLS } from '../../engine/constants';
import './Modal.css';

export default function TimeModal({ onPick }) {
  return (
    <div className="overlay">
      <div className="panel">
        <h2>Chess vs Claude</h2>
        <p>Choose your time control</p>
        <div className="btn-grid">
          {TIME_CONTROLS.map(({ secs, label, tag, accent }) => (
            <button
              key={secs}
              className={`pick-btn${accent ? ' accent' : ''}`}
              onClick={() => onPick(secs)}
            >
              {label}
              <small>{tag}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
