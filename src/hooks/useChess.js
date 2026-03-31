import { useState, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'

export function useChess() {
  const gameRef = useRef(new Chess())
  const [fen, setFen] = useState(gameRef.current.fen())
  const [selectedSq, setSelectedSq] = useState(null)
  const [legalMoves, setLegalMoves] = useState([])
  const [lastMove, setLastMove] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [hint, setHint] = useState(null)

  const game = gameRef.current

  const sync = useCallback(() => {
    setFen(game.fen())
  }, [])

  const checkEnd = useCallback(() => {
    if (game.isGameOver()) {
      setGameOver(true)
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate'
        setGameResult(winner)
      } else if (game.isStalemate()) {
        setGameResult('Draw — stalemate')
      } else if (game.isThreefoldRepetition()) {
        setGameResult('Draw — threefold repetition')
      } else if (game.isInsufficientMaterial()) {
        setGameResult('Draw — insufficient material')
      } else {
        setGameResult('Game over')
      }
      return true
    }
    return false
  }, [])

  // Returns true if a move was made (for caller to switch clock)
  const selectSquare = useCallback((sqOrFrom, to = null, promotion = 'q') => {
    // Called directly by AI with from/to
    if (to !== null) {
      const move = game.move({ from: sqOrFrom, to, promotion })
      if (move) {
        setLastMove({ from: sqOrFrom, to })
        setMoveHistory(h => [...h, {
          san: move.san, color: move.color,
          from: move.from, to: move.to,
          flags: move.flags, piece: move.piece,
          captured: move.captured, fen: game.fen()
        }])
        setSelectedSq(null)
        setLegalMoves([])
        sync()
        checkEnd()
        return true
      }
      return false
    }

    // Human click
    const sq = sqOrFrom
    const piece = game.get(sq)

    // If a square is already selected…
    if (selectedSq) {
      // Try to make move
      if (legalMoves.includes(sq)) {
        const p = game.get(selectedSq)
        const isPromo = p?.type === 'p' && (sq[1] === '8' || sq[1] === '1')
        const move = game.move({ from: selectedSq, to: sq, promotion: isPromo ? 'q' : undefined })
        if (move) {
          setLastMove({ from: selectedSq, to: sq })
          setMoveHistory(h => [...h, {
            san: move.san, color: move.color,
            from: move.from, to: move.to,
            flags: move.flags, piece: move.piece,
            captured: move.captured, fen: game.fen()
          }])
          setSelectedSq(null)
          setLegalMoves([])
          setHint(null)
          sync()
          checkEnd()
          return true
        }
      }
      // Re-select own piece
      if (piece && piece.color === game.turn()) {
        setSelectedSq(sq)
        setLegalMoves(game.moves({ square: sq, verbose: true }).map(m => m.to))
        return false
      }
      // Deselect
      setSelectedSq(null)
      setLegalMoves([])
      return false
    }

    // First click — select if own piece
    if (piece && piece.color === game.turn()) {
      setSelectedSq(sq)
      setLegalMoves(game.moves({ square: sq, verbose: true }).map(m => m.to))
    }
    return false
  }, [selectedSq, legalMoves, game, sync, checkEnd])

  const resetGame = useCallback(() => {
    gameRef.current = new Chess()
    setFen(gameRef.current.fen())
    setSelectedSq(null)
    setLegalMoves([])
    setLastMove(null)
    setMoveHistory([])
    setGameOver(false)
    setGameResult(null)
    setHint(null)
  }, [])

  const undoMove = useCallback(() => {
    if (gameOver) return
    game.undo() // undo AI move
    game.undo() // undo player move
    setMoveHistory(h => h.slice(0, -2))
    setSelectedSq(null)
    setLegalMoves([])
    setLastMove(null)
    setHint(null)
    sync()
  }, [gameOver, sync])

  const getHint = useCallback(() => {
    const moves = game.moves({ verbose: true })
    if (!moves.length) return
    // Prefer captures then checks
    const captures = moves.filter(m => m.captured)
    const pick = captures.length ? captures[0] : moves[Math.floor(Math.random() * moves.length)]
    setHint({ from: pick.from, to: pick.to })
    setTimeout(() => setHint(null), 2500)
  }, [game])

  return {
    game: gameRef.current,
    fen, selectedSq, legalMoves, lastMove,
    moveHistory, gameOver, gameResult,
    selectSquare, resetGame, undoMove, getHint, hint,
  }
}
