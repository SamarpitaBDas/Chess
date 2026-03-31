import { useState, useEffect, useCallback } from 'react'
import Board from './components/Board/Board'
import Timer from './components/Timer/Timer'
import Controls from './components/Controls/Controls'
import MoveHistory from './components/MoveHistory/MoveHistory'
import Analysis from './components/Analysis/Analysis'
import { useChess } from './hooks/useChess'
import { useStockfish } from './hooks/useStockfish'
import { useTimer } from './hooks/useTimer'
import './App.css'

export default function App() {
  const [difficulty, setDifficulty] = useState(2)
  const [flipped, setFlipped] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [gameKey, setGameKey] = useState(0)

  const {
    game,
    fen,
    selectedSq,
    legalMoves,
    lastMove,
    moveHistory,
    gameOver,
    gameResult,
    selectSquare,
    resetGame: resetChess,
    undoMove,
    getHint,
    hint,
  } = useChess()

  const { requestMove: aiMove, isThinking, evalScore } = useStockfish(difficulty)

  const {
    whiteTime,
    blackTime,
    activeColor,
    startTimer,
    stopTimer,
    switchClock,
    resetTimers,
  } = useTimer(600, 600)

  // AI plays black — trigger when it's black's turn
  useEffect(() => {
    if (!gameOver && game.turn() === 'b' && !isThinking) {
      aiMove(fen, (uciMove) => {
        selectSquare(uciMove.from, uciMove.to, uciMove.promotion)
        switchClock()
      })
    }
  }, [fen, gameOver])

  // Game over: stop clock, show analysis
  useEffect(() => {
    if (gameOver) {
      stopTimer()
      setShowAnalysis(true)
    }
  }, [gameOver])

  // Timer timeout
  useEffect(() => {
    if (whiteTime <= 0 && !gameOver) {
      stopTimer()
      setShowAnalysis(true)
    }
    if (blackTime <= 0 && !gameOver) {
      stopTimer()
      setShowAnalysis(true)
    }
  }, [whiteTime, blackTime])

  const handleSquareClick = useCallback((sq) => {
    if (gameOver || game.turn() !== 'w') return
    const moved = selectSquare(sq)
    if (moved) switchClock()
  }, [gameOver, game, selectSquare])

  const handleNewGame = useCallback(() => {
    resetChess()
    resetTimers()
    setShowAnalysis(false)
    setGameKey(k => k + 1)
    startTimer()
  }, [])

  const handleResign = useCallback(() => {
    stopTimer()
    setShowAnalysis(true)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Chess AI <span className="pawn-icon">♟</span></h1>
        <p className="app-sub">Rapid · 10 min · AI opponent</p>
      </header>

      <div className="app-body">
        <div className="board-column">
          <div className="player-tag opponent">
            <span className="dot black" />
            <span>Black (AI)</span>
            {isThinking && <span className="thinking-badge">thinking…</span>}
          </div>

          <Board
            key={gameKey}
            fen={fen}
            selectedSq={selectedSq}
            legalMoves={legalMoves}
            lastMove={lastMove}
            hint={hint}
            flipped={flipped}
            onSquareClick={handleSquareClick}
            inCheck={game.in_check()}
            turn={game.turn()}
          />

          <div className="player-tag you">
            <span className="dot white" />
            <span>You (White)</span>
          </div>
        </div>

        <div className="side-column">
          <Timer
            whiteTime={whiteTime}
            blackTime={blackTime}
            activeColor={activeColor}
            gameOver={gameOver}
          />

          <Controls
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onNewGame={handleNewGame}
            onUndo={undoMove}
            onHint={getHint}
            onResign={handleResign}
            onFlip={() => setFlipped(f => !f)}
            gameOver={gameOver}
            isThinking={isThinking}
          />

          <MoveHistory moves={moveHistory} />

          {gameResult && (
            <div className="result-card">
              <span className="result-icon">🏁</span>
              <span>{gameResult}</span>
            </div>
          )}
        </div>
      </div>

      {showAnalysis && (
        <Analysis
          moveHistory={moveHistory}
          gameResult={gameResult}
          whiteTime={whiteTime}
          blackTime={blackTime}
          onClose={() => setShowAnalysis(false)}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  )
}
