import { formatTime } from '../../engine/utils';
import './PlayerBar.css';

export default function PlayerBar({
  position,
  avatar,
  name,
  label,
  time,
  active,
  idle,
}) {
  const classes = ['player-bar'];
  if (idle) classes.push('idle');
  else if (active) {
    if (time <= 0) classes.push('out');
    else if (time <= 10) classes.push('low');
    else classes.push('active');
  } else classes.push('idle');

  return (
    <div className={`players ${position}`}>
      <div className={classes.join(' ')}>
        <div className="player-avatar">{avatar}</div>
        <div className="player-info">
          <div className="player-name">{name}</div>
          <div className="player-label">{label}</div>
        </div>
        <div className="player-time">{formatTime(time)}</div>
      </div>
    </div>
  );
}
