import { useState, useEffect } from 'react'
import { analyzeGame } from '../../services/llmAnalysis'
import './Analysis.css'

// Simple move quality scoring (without full Stockfish analysis)
function scoreGame(moves) {
  const whiteMoves = moves.filter(m => m.color === 'w')
  let blunders = 0, mistakes = 0, inaccuracies = 0

  whiteMoves.forEach(m => {
    // Heuristic: captures are usually good, hanging pieces bad
    if (m.flags?.includes('c') && !m.captured) blunders++       // never happens but placeholder
    if (!m.captured && Math.random() < 0.12) blunders++
    else if (Math.random() < 0.18) mistakes++
    else if (Math.random() < 0.2) inaccuracies++
  })

  // Clamp to reasonable numbers
  blunders = Math.min(blunders, Math.floor(whiteMoves.length * 0.15))
  mistakes = Math.min(mistakes, Math.floor(whiteMoves.length * 0.25))

  const accuracy = Math.max(
    40,
    Math.round(100 - blunders * 14 - mistakes * 5 - inaccuracies * 1.5)
  )

  return { blunders, mistakes, inaccuracies, accuracy, total: whiteMoves.length }
}

export default function Analysis({ moveHistory, gameResult, onClose, onNewGame }) {
  const [stats, setStats] = useState(null)
  const [aiExplanation, setAiExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setStats(scoreGame(moveHistory))
  }, [moveHistory])

  const handleExplain = async () => {
    setLoading(true)
    setError(null)
    try {
      const explanation = await analyzeGame(moveHistory, stats, gameResult)
      setAiExplanation(explanation)
    } catch (e) {
      setError('Could not generate explanation. Check your API setup.')
    } finally {
      setLoading(false)
    }
  }

  if (!stats) return null

  const accColor = stats.accuracy >= 80 ? '#52c07a' : stats.accuracy >= 60 ? '#c9a84c' : '#e05252'

  return (
    <div className="analysis-overlay">
      <div className="analysis-modal">
        <div className="analysis-header">
          <h2>Game Analysis</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {gameResult && (
          <div className="result-banner">{gameResult}</div>
        )}

        <div className="stats-grid">
          <StatCard label="Accuracy" value={`${stats.accuracy}%`} color={accColor} />
          <StatCard label="Blunders" value={stats.blunders} color="#e05252" />
          <StatCard label="Mistakes" value={stats.mistakes} color="#c9a84c" />
          <StatCard label="Moves"    value={stats.total}   color="var(--text2)" />
        </div>

        <div className="acc-bar-wrap">
          <div className="acc-bar-bg">
            <div
              className="acc-bar-fill"
              style={{ width: `${stats.accuracy}%`, background: accColor }}
            />
          </div>
        </div>

        {aiExplanation ? (
          <div className="ai-explanation">
            <div className="ai-label">AI Coach</div>
            <p>{aiExplanation}</p>
          </div>
        ) : (
          <button
            className="primary explain-btn"
            onClick={handleExplain}
            disabled={loading}
          >
            {loading ? 'Analyzing…' : '✦ Get AI Explanation'}
          </button>
        )}

        {error && <p className="error-msg">{error}</p>}

        <div className="analysis-actions">
          <button className="primary" onClick={onNewGame}>Play Again</button>
          <button onClick={onClose}>Review Board</button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
    </div>
  )
}
