# Chess AI — Rapid Chess with AI Opponent

A full-featured chess app built with React + chess.js + Stockfish, with post-game analysis powered by Claude AI.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up Stockfish (copy the engine into public/)
npx stockfish-setup   # or manually: see below

# 3. Add your Anthropic API key
cp .env.example .env
# Edit .env and add your key from https://console.anthropic.com

# 4. Run the dev server
npm run dev
```

---

## Project Structure

```
chess-ai/
├── public/
│   └── stockfish/
│       └── stockfish.js          ← copy from node_modules/stockfish/src/
├── src/
│   ├── assets/                   ← your PNG piece images go here
│   │   ├── chess-pawn-white.png
│   │   ├── chess-rook-white.png
│   │   ├── chess-knight-white.png
│   │   ├── chess-bishop-white.png
│   │   ├── chess-queen-white.png
│   │   ├── chess-king-white.png
│   │   ├── chess-pawn-black.png
│   │   ├── chess-rook-black.png
│   │   ├── chess-knight-black.png
│   │   ├── chess-bishop-black.png
│   │   ├── chess-queen-black.png
│   │   └── chess-king-black.png
│   ├── components/
│   │   ├── Board/                ← chessboard rendering + piece images
│   │   ├── Timer/                ← dual chess clocks
│   │   ├── Controls/             ← difficulty, undo, hint, resign
│   │   ├── MoveHistory/          ← scrollable PGN move list
│   │   └── Analysis/             ← post-game stats + Claude explanation
│   ├── hooks/
│   │   ├── useChess.js           ← all chess.js logic
│   │   ├── useStockfish.js       ← Stockfish Web Worker integration
│   │   └── useTimer.js           ← rapid clock logic
│   ├── services/
│   │   └── llmAnalysis.js        ← Claude API post-game coach
│   ├── App.jsx
│   └── App.css
├── .env.example
├── package.json
└── vite.config.js
```

---

## Setting Up Stockfish

```bash
npm install stockfish

# Copy the engine file to public so it can be loaded as a Web Worker
cp node_modules/stockfish/src/stockfish-nnue-16.js public/stockfish/stockfish.js

# If that file doesn't exist, try:
cp node_modules/stockfish/src/stockfish.js public/stockfish/stockfish.js
```

The `vite.config.js` already sets the required COOP/COEP headers for WASM threads.

If Stockfish fails to load (e.g., COOP/COEP issues in deployment), the app falls back to a built-in heuristic AI automatically.

---

## Your PNG Assets

Your piece images are already wired up in `src/components/Board/Piece.jsx`.

Expected filenames (must match exactly):
- `chess-pawn-white.png`, `chess-rook-white.png`, `chess-knight-white.png`
- `chess-bishop-white.png`, `chess-queen-white.png`, `chess-king-white.png`
- `chess-pawn-black.png`, `chess-rook-black.png`, `chess-knight-black.png`
- `chess-bishop-black.png`, `chess-queen-black.png`, `chess-king-black.png`

Place all 12 files in `src/assets/`. If your filenames differ, update the imports in `Piece.jsx`.

---

## Features

- Full chess rules via chess.js (castling, en passant, promotion, all draw conditions)
- Legal move highlights + last move highlight + check indicator
- 10-minute rapid timer for both players
- 4 AI difficulty levels (Beginner → Master) via Stockfish Skill Level
- Undo, Resign, Hint, Flip Board
- Post-game analysis: accuracy %, blunders, mistakes
- Claude AI coaching explanation after each game

---

## Adding a Backend (Optional)

To save game history and user stats, add a simple Express server:

```bash
npm install express cors better-sqlite3
```

Create `server/index.js` and add endpoints:
- `POST /games` — save completed game (PGN, result, accuracy)
- `GET /games` — fetch history
- `GET /stats` — win rate, avg accuracy, blunder rate

---

## Deployment Notes

For production, move the Anthropic API call in `src/services/llmAnalysis.js`
to a backend route so your API key is never exposed in the browser bundle.
