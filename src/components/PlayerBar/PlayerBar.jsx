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
  const timeClasses = ['player-time-bar'];
  if (idle) timeClasses.push('idle');
  else if (active) {
    if (time <= 0) timeClasses.push('out');
    else if (time <= 10) timeClasses.push('low');
    else timeClasses.push('active');
  } else timeClasses.push('idle');

  return (
    <div className={`players ${position}`}>
      <div className="player-detail-bar">
        <div className="player-avatar">{avatar}</div>
        <div className="player-info">
          <div className="player-name">{name}</div>
          <div className="player-label">{label}</div>
        </div>
      </div>

      <div className={timeClasses.join(' ')}>
        <div className="player-time">{formatTime(time)}</div>
      </div>
    </div>
  );
}
