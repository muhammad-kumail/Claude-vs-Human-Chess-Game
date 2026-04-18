import { PIECE_IMAGES } from '../../engine/constants';
import './Square.css';

export default function Square({
  r,
  c,
  piece,
  isLight,
  isFrom,
  isTo,
  isSelected,
  isInCheck,
  isHighlight,
  isCapture,
  showThinkingDot,
  onClick,
}) {
  const classes = ['square', isLight ? 'light' : 'dark'];
  if (isFrom) classes.push('sq-from');
  if (isTo) classes.push('sq-to');
  if (isSelected) classes.push('selected');
  if (isInCheck) classes.push('in-check');
  if (isHighlight) classes.push('highlight');
  if (isCapture) classes.push('capture');

  return (
    <div className={classes.join(' ')} onClick={() => onClick(r, c)}>
      {showThinkingDot && <div className="thinking-dot" />}
      {piece && <img src={PIECE_IMAGES[piece]} alt={piece} />}
    </div>
  );
}
