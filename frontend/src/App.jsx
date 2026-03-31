// import { useState } from 'react'
import wp from './assets/chess-pawn-white.png'
import wr from "./assets/chess-rook-white.png";
import wn from "./assets/chess-knight-white.png";
import wb from "./assets/chess-bishop-white.png";
import wq from "./assets/chess-queen-white.png";
import wk from "./assets/chess-king-white.png";

import bp from "./assets/chess-pawn-black.png";
import br from "./assets/chess-rook-black.png";
import bn from "./assets/chess-knight-black.png";
import bb from "./assets/chess-bishop-black.png";
import bq from "./assets/chess-queen-black.png";
import bk from "./assets/chess-king-black.png";

import './App.css'

const pieces = {
  wp, wr, wn, wb, wq, wk,
  bp, br, bn, bb, bq, bk,
};

function App() {
  const pieces = {
    wp, wr, wn, wb, wq, wk,
    bp, br, bn, bb, bq, bk,
  };

  const row = ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"];

  return (
    <div className="flex flex-col items-center mt-10">
      <h1 className="text-3xl font-bold mb-6">
        Chess AI App ♟️
      </h1>

      <div className="grid grid-cols-8 gap-2">
        {row.map((p, index) => (
          <img
            key={index}
            src={pieces[p]}
            alt={p}
            className="w-12 h-12"
          />
        ))}
      </div>
    </div>
  );
}

export default App
