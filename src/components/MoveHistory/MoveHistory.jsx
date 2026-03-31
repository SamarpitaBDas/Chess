import { useEffect, useRef } from 'react'
import './MoveHistory.css'

export default function MoveHistory({ moves }) {
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [moves])

  const paired = []
  for (let i = 0; i < moves.length; i += 2) {
    paired.push({ num: i / 2 + 1, white: moves[i], black: moves[i + 1] })
  }

  return (
    <div className="card">
      <div className="card-title">Moves</div>
      <div className="moves-list" ref={listRef}>
        {paired.length === 0 && (
          <span className="moves-empty">Game not started</span>
        )}
        {paired.map(row => (
          <div key={row.num} className="move-row">
            <span className="move-num">{row.num}.</span>
            <span className="move-san white-move">{row.white?.san ?? ''}</span>
            <span className="move-san black-move">{row.black?.san ?? ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
