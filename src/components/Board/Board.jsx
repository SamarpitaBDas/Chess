import { useMemo } from 'react'
import { Chess } from 'chess.js'
import Piece from './Piece'
import './Board.css'

const FILES = ['a','b','c','d','e','f','g','h']
const RANKS = [1,2,3,4,5,6,7,8]

export default function Board({
  fen, selectedSq, legalMoves, lastMove, hint,
  flipped, onSquareClick, inCheck, turn
}) {
  const game = useMemo(() => new Chess(fen), [fen])

  const ranks = flipped ? RANKS : [...RANKS].reverse()
  const files = flipped ? [...FILES].reverse() : FILES

  // Find king in check square
  let checkSq = null
  if (inCheck) {
    for (const r of RANKS) {
      for (const f of FILES) {
        const sq = f + r
        const p = game.get(sq)
        if (p && p.type === 'k' && p.color === turn) { checkSq = sq; break }
      }
      if (checkSq) break
    }
  }

  return (
    <div className="board-container">
      <div className="rank-labels">
        {ranks.map(r => <span key={r}>{r}</span>)}
      </div>

      <div>
        <div className="board">
          {ranks.map(rank =>
            files.map(file => {
              const sq = file + rank
              const piece = game.get(sq)
              const isLight = (FILES.indexOf(file) + rank) % 2 !== 0
              const isSelected = selectedSq === sq
              const isLegal = legalMoves?.includes(sq)
              const isLastFrom = lastMove?.from === sq
              const isLastTo = lastMove?.to === sq
              const isCheck = checkSq === sq
              const isHintFrom = hint?.from === sq
              const isHintTo = hint?.to === sq
              const hasPiece = !!piece

              return (
                <div
                  key={sq}
                  className={[
                    'square',
                    isLight ? 'light' : 'dark',
                    isSelected ? 'selected' : '',
                    isLastFrom || isLastTo ? 'last-move' : '',
                    isCheck ? 'in-check' : '',
                    isHintFrom || isHintTo ? 'hint' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onSquareClick(sq)}
                >
                  {isLegal && (
                    <div className={`move-dot ${hasPiece ? 'capture-ring' : 'dot'}`} />
                  )}
                  {piece && (
                    <Piece type={piece.type} color={piece.color} />
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="file-labels">
          {files.map(f => <span key={f}>{f}</span>)}
        </div>
      </div>
    </div>
  )
}
