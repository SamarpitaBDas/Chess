// ─── PNG Asset Imports ─────────────────────────────────────────────────────
// These match your existing asset file names exactly.
// Place all PNGs in src/assets/

import wp from '../../assets/chess-pawn-white.png'
import wr from '../../assets/chess-rook-white.png'
import wn from '../../assets/chess-knight-white.png'
import wb from '../../assets/chess-bishop-white.png'
import wq from '../../assets/chess-queen-white.png'
import wk from '../../assets/chess-king-white.png'

import bp from '../../assets/chess-pawn-black.png'
import br from '../../assets/chess-rook-black.png'
import bn from '../../assets/chess-knight-black.png'
import bb from '../../assets/chess-bishop-black.png'
import bq from '../../assets/chess-queen-black.png'
import bk from '../../assets/chess-king-black.png'

const PIECE_IMAGES = {
  wp, wr, wn, wb, wq, wk,
  bp, br, bn, bb, bq, bk,
}

// chess.js uses lowercase type: 'p','r','n','b','q','k'
// and color: 'w' or 'b'
export default function Piece({ type, color }) {
  const key = color + type   // e.g. "wp", "bk"
  const src = PIECE_IMAGES[key]
  if (!src) return null

  return (
    <img
      src={src}
      alt={key}
      className="piece-img"
      draggable={false}
    />
  )
}
