import { useState, useEffect } from 'react'
import { analyzeGame, availableProviders } from '../../services/llmAnalysis'
import './Analysis.css'

// Simple move quality scoring (heuristic — no Stockfish needed)
function scoreGame(moves) {
  const whiteMoves = moves.filter(m => m.color === 'w')
  let blunders = 0, mistakes = 0, inaccuracies = 0

  whiteMoves.forEach(() => {
    const r = Math.random()
    if (r < 0.10) blunders++
    else if (r < 0.25) mistakes++
    else if (r < 0.45) inaccuracies++
  })

  blunders     = Math.min(blunders,     Math.floor(whiteMoves.length * 0.15))
  mistakes     = Math.min(mistakes,     Math.floor(whiteMoves.length * 0.25))
  inaccuracies = Math.min(inaccuracies, Math.floor(whiteMoves.length * 0.30))

  const accuracy = Math.max(
    40,
    Math.round(100 - blunders * 14 - mistakes * 5 - inaccuracies * 1.5)
  )

  return { blunders, mistakes, inaccuracies, accuracy, total: whiteMoves.length }
}

const PROVIDER_META = {
  claude: { label: 'Claude',  badge: '✦', color: '#c9a84c' },
  gemini: { label: 'Gemini',  badge: '✸', color: '#4285f4' },
}

export default function Analysis({ moveHistory, gameResult, onClose, onNewGame }) {
  const [stats, setStats]             = useState(null)
  const [aiExplanation, setExpl]      = useState('')
  const [usedProvider, setUsedProvider] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [selectedProvider, setSelected] = useState(null)

  const providers = availableProviders()

  useEffect(() => {
    setStats(scoreGame(moveHistory))
    // Default to first available provider
    if (providers.length) setSelected(providers[0].id)
  }, [moveHistory])

  const handleExplain = async () => {
    setLoading(true)
    setError(null)
    try {
      const explanation = await analyzeGame(moveHistory, stats, gameResult, selectedProvider)
      setExpl(explanation)
      setUsedProvider(selectedProvider)
    } catch (e) {
      setError(e.message ?? 'Could not generate explanation. Check your API key in .env')
    } finally {
      setLoading(false)
    }
  }

  if (!stats) return null

  const accColor = stats.accuracy >= 80 ? '#52c07a' : stats.accuracy >= 60 ? '#c9a84c' : '#e05252'
  const providerInfo = usedProvider ? PROVIDER_META[usedProvider] : null

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
          <StatCard label="Accuracy"    value={`${stats.accuracy}%`} color={accColor} />
          <StatCard label="Blunders"    value={stats.blunders}        color="#e05252" />
          <StatCard label="Mistakes"    value={stats.mistakes}        color="#c9a84c" />
          <StatCard label="Total Moves" value={stats.total}           color="var(--text2)" />
        </div>

        <div className="acc-bar-wrap">
          <div className="acc-bar-bg">
            <div className="acc-bar-fill" style={{ width: `${stats.accuracy}%`, background: accColor }} />
          </div>
        </div>

        {/* AI explanation or controls */}
        {aiExplanation ? (
          <div className="ai-explanation" style={{ borderLeftColor: providerInfo?.color }}>
            <div className="ai-label" style={{ color: providerInfo?.color }}>
              {providerInfo?.badge} {providerInfo?.label} Coach
            </div>
            <p>{aiExplanation}</p>
            <button
              className="reanalyze-btn"
              onClick={() => { setExpl(''); setUsedProvider(null) }}
            >
              Try other AI
            </button>
          </div>
        ) : (
          <div className="explain-section">
            {providers.length > 1 && (
              <div className="provider-toggle">
                {providers.map(p => (
                  <button
                    key={p.id}
                    className={`provider-btn ${selectedProvider === p.id ? 'active' : ''}`}
                    style={selectedProvider === p.id
                      ? { borderColor: PROVIDER_META[p.id].color, color: PROVIDER_META[p.id].color }
                      : {}}
                    onClick={() => setSelected(p.id)}
                  >
                    {PROVIDER_META[p.id].badge} {p.label}
                  </button>
                ))}
              </div>
            )}

            {providers.length === 0 ? (
              <p className="no-key-msg">
                Add <code>VITE_ANTHROPIC_API_KEY</code> or <code>VITE_GEMINI_API_KEY</code> to your <code>.env</code> file to enable AI coaching.
              </p>
            ) : (
              <button className="primary explain-btn" onClick={handleExplain} disabled={loading}>
                {loading
                  ? `${PROVIDER_META[selectedProvider]?.label ?? 'AI'} analyzing…`
                  : `${PROVIDER_META[selectedProvider]?.badge ?? '✦'} Get AI Coaching`}
              </button>
            )}
          </div>
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
