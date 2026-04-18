import { useState } from 'react';
import './Modal.css';

export default function PGNModal({ pgnText, onClose }) {
  const [toast, setToast] = useState('');

  const copyPGN = () => {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = pgnText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setToast('Copied!');
      setTimeout(() => setToast(''), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(pgnText)
        .then(() => {
          setToast('Copied to clipboard!');
          setTimeout(() => setToast(''), 2000);
        })
        .catch(fallback);
    } else {
      fallback();
    }
  };

  return (
    <div className="overlay">
      <div className="panel pgn-panel">
        <h2>PGN Export</h2>
        <div className="pgn-box-wrap">
          <div className="pgn-box">{pgnText}</div>
          <button
            className="copy-btn"
            title="Copy PGN"
            onClick={copyPGN}
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
            </svg>
          </button>
        </div>
        <div className="copy-toast">{toast}</div>
        <button className="pgn-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
