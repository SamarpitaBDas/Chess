import { useRef, useState, useEffect } from 'react'

export function useStockfish(skillLevel = 2) {
  const workerRef = useRef(null)
  const callbackRef = useRef(null)
  const [isThinking, setIsThinking] = useState(false)
  const [evalScore, setEvalScore] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Try loading Stockfish — works in browser with the npm package
    // Run: npm install stockfish
    // Then place stockfish.js in public/stockfish/stockfish.js
    try {
      const worker = new Worker('/stockfish/stockfish.js')
      worker.onmessage = (e) => {
        const msg = typeof e.data === 'string' ? e.data : e.data?.toString()
        if (!msg) return

        if (msg === 'readyok') {
          setReady(true)
        }

        // Eval bar
        if (msg.includes('score cp')) {
          const match = msg.match(/score cp (-?\d+)/)
          if (match) setEvalScore(parseInt(match[1]))
        }
        if (msg.includes('score mate')) {
          const match = msg.match(/score mate (-?\d+)/)
          if (match) setEvalScore(match[1] > 0 ? 10000 : -10000)
        }

        if (msg.startsWith('bestmove')) {
          const parts = msg.split(' ')
          const uci = parts[1]
          setIsThinking(false)
          if (uci && uci !== '(none)' && callbackRef.current) {
            callbackRef.current({
              from: uci.slice(0, 2),
              to: uci.slice(2, 4),
              promotion: uci[4] || 'q',
            })
            callbackRef.current = null
          }
        }
      }
      worker.onerror = () => { setReady(false) }
      worker.postMessage('uci')
      worker.postMessage(`setoption name Skill Level value ${skillLevel}`)
      worker.postMessage('isready')
      workerRef.current = worker
    } catch {
      setReady(false)
    }

    return () => workerRef.current?.terminate()
  }, [])

  // Update skill level dynamically
  useEffect(() => {
    if (workerRef.current && ready) {
      workerRef.current.postMessage(`setoption name Skill Level value ${skillLevel}`)
    }
  }, [skillLevel, ready])

  const requestMove = (fen, callback) => {
    callbackRef.current = callback
    setIsThinking(true)

    if (workerRef.current && ready) {
      const thinkTime = 200 + skillLevel * 80
      workerRef.current.postMessage(`position fen ${fen}`)
      workerRef.current.postMessage(`go skill level ${skillLevel} movetime ${thinkTime}`)
    } else {
      // Fallback: smart random AI when Stockfish isn't loaded
      fallbackAI(fen, skillLevel, callback)
        .then(() => setIsThinking(false))
    }
  }

  return { requestMove, isThinking, evalScore, stockfishReady: ready }
}

// Fallback AI when Stockfish worker isn't available
async function fallbackAI(fen, skill, callback) {
  const { Chess } = await import('chess.js')
  const g = new Chess(fen)
  const moves = g.moves({ verbose: true })
  if (!moves.length) return

  await new Promise(r => setTimeout(r, 400 + Math.random() * 400))

  // Higher skill → prioritise captures, checks, central moves
  let pick
  if (skill >= 15) {
    const checks = moves.filter(m => { const t = new Chess(fen); t.move(m); return t.inCheck() })
    const captures = moves.filter(m => m.captured)
    if (checks.length) pick = checks[0]
    else if (captures.length) pick = captures.sort((a,b) => pieceVal(b.captured) - pieceVal(a.captured))[0]
  } else if (skill >= 8) {
    const captures = moves.filter(m => m.captured)
    if (captures.length && Math.random() > 0.3) pick = captures[0]
  }

  if (!pick) pick = moves[Math.floor(Math.random() * moves.length)]
  callback({ from: pick.from, to: pick.to, promotion: 'q' })
}

function pieceVal(p) {
  return { p:1, n:3, b:3, r:5, q:9, k:0 }[p] || 0
}
