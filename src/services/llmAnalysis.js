/**
 * analyzeGame — calls Claude to generate a human-friendly post-game explanation.
 *
 * Setup:
 *   1. In your project root create a file: .env
 *   2. Add: VITE_ANTHROPIC_API_KEY=sk-ant-...
 *
 * ⚠️  For production, route this through your own backend so the key is never
 *     exposed in the browser bundle.
 */

export async function analyzeGame(moveHistory, stats, gameResult) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY not set in .env')
  }

  const sanMoves = moveHistory.map(m => m.san).join(' ')
  const whiteMoves = moveHistory.filter(m => m.color === 'w').map(m => m.san).join(' ')

  const prompt = `You are a chess coach analyzing a rapid chess game.

Game result: ${gameResult ?? 'unknown'}
Full move list (PGN): ${sanMoves}
White's moves only: ${whiteMoves}

Stats for White (the human player):
- Accuracy: ${stats?.accuracy ?? '?'}%
- Blunders: ${stats?.blunders ?? '?'}
- Mistakes: ${stats?.mistakes ?? '?'}
- Total moves: ${stats?.total ?? '?'}

Give a short (3–5 sentence) friendly coaching analysis. Mention:
1. The biggest mistake or turning point if you can identify one from the moves.
2. One specific concept the player should study (e.g. "piece activity", "king safety", "endgame technique").
3. One encouraging observation.

Keep it concise, plain English, no markdown.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text ?? 'No explanation available.'
}
