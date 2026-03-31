import './Controls.css'

const DIFFICULTIES = [
  { label: 'Beginner', level: 2 },
  { label: 'Club',     level: 8 },
  { label: 'Advanced', level: 15 },
  { label: 'Master',   level: 20 },
]

export default function Controls({
  difficulty, onDifficultyChange,
  onNewGame, onUndo, onHint, onResign, onFlip,
  gameOver, isThinking
}) {
  return (
    <div className="controls-wrap">
      <div className="card">
        <div className="card-title">Difficulty</div>
        <div className="diff-row">
          {DIFFICULTIES.map(d => (
            <button
              key={d.level}
              className={`diff-btn ${difficulty === d.level ? 'active' : ''}`}
              onClick={() => onDifficultyChange(d.level)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Controls</div>
        <div className="btn-grid">
          <button className="primary" onClick={onNewGame}>New Game</button>
          <button onClick={onFlip}>Flip Board</button>
          <button onClick={onUndo} disabled={gameOver || isThinking}>Undo</button>
          <button onClick={onHint} disabled={gameOver || isThinking}>Hint</button>
          <button className="danger" onClick={onResign} disabled={gameOver}>Resign</button>
        </div>
      </div>
    </div>
  )
}
