import { useEffect, useMemo, useRef } from 'react';
import './MoveList.css';

function formatMoves(pgnMoves) {
  const rows = [];
  for (let i = 0; i < pgnMoves.length; i += 2) {
    rows.push({
      moveNo: i / 2 + 1,
      w: pgnMoves[i] ?? '',
      b: pgnMoves[i + 1] ?? '',
      last: i === pgnMoves.length - 1 || i + 1 === pgnMoves.length - 1,
    });
  }
  return rows;
}

export default function MoveList({ pgnMoves }) {
  const listRef = useRef(null);

  const rows = useMemo(() => formatMoves(pgnMoves), [pgnMoves]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [pgnMoves.length]);

  return (
    <aside className="move-list">
      <div className="move-list__header">Moves</div>
      <div ref={listRef} className="move-list__body">
        {rows.length === 0 ? (
          <div className="move-list__empty">No moves yet</div>
        ) : (
          rows.map((r) => (
            <div key={r.moveNo} className="move-row">
              <div className="move-no">{r.moveNo}.</div>
              <div className="move white">{r.w}</div>
              <div className="move black">{r.b}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

