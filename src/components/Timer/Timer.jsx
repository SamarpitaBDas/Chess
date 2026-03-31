import './Timer.css'

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Timer({ whiteTime, blackTime, activeColor, gameOver }) {
  return (
    <div className="card">
      <div className="card-title">Clock</div>
      <div className="timers">
        <Clock
          label="Black (AI)"
          time={blackTime}
          active={activeColor === 'b' && !gameOver}
          side="black"
        />
        <Clock
          label="White (You)"
          time={whiteTime}
          active={activeColor === 'w' && !gameOver}
          side="white"
        />
      </div>
    </div>
  )
}

function Clock({ label, time, active, side }) {
  const low = time < 30
  return (
    <div className={`clock ${active ? 'active' : ''} ${side}`}>
      <div className="clock-label">{label}</div>
      <div className={`clock-time ${low ? 'low' : ''}`}>
        {fmt(time)}
      </div>
    </div>
  )
}
