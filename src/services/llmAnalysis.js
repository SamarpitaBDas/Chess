/**
 * llmAnalysis.js — AI coaching using either Claude (Anthropic) or Gemini (Google).
 *
 * Setup — add to your .env file:
 *   VITE_ANTHROPIC_API_KEY=sk-ant-...     ← for Claude
 *   VITE_GEMINI_API_KEY=AIza...           ← for Gemini
 *
 * You can provide one or both keys. The Analysis UI lets the player pick.
 *
 * ⚠️  For production, proxy these calls through your own backend so keys
 *     are never exposed in the browser bundle.
 */

export const AI_PROVIDERS = {
  claude: {
    id: 'claude',
    label: 'Claude',
    envKey: 'VITE_ANTHROPIC_API_KEY',
  },
  gemini: {
    id: 'gemini',
    label: 'Gemini',
    envKey: 'VITE_GEMINI_API_KEY',
  },
}

/** Returns which providers have API keys configured */
export function availableProviders() {
  return Object.values(AI_PROVIDERS).filter(
    (p) => !!import.meta.env[p.envKey]
  )
}

/** Build the shared coaching prompt */
function buildPrompt(moveHistory, stats, gameResult) {
  const sanMoves = moveHistory.map((m) => m.san).join(' ')
  const whiteMoves = moveHistory
    .filter((m) => m.color === 'w')
    .map((m) => m.san)
    .join(' ')

  return `You are a chess coach analyzing a rapid chess game.

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
}

/** Claude via Anthropic Messages API */
async function analyzeWithClaude(prompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set in .env')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Claude API error ${res.status}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? 'No explanation available.'
}

/** Gemini via Google Generative Language API */
async function analyzeWithGemini(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not set in .env')

  const model = 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 350, temperature: 0.7 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      err?.error?.message ?? `Gemini API error ${res.status}`
    )
  }

  const data = await res.json()
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No explanation available.'
  )
}

/**
 * Main export — call with provider = 'claude' | 'gemini'
 * Defaults to whichever key is available, preferring Claude.
 */
export async function analyzeGame(moveHistory, stats, gameResult, provider) {
  const prompt = buildPrompt(moveHistory, stats, gameResult)

  // Auto-select if not specified
  if (!provider) {
    const available = availableProviders()
    if (!available.length)
      throw new Error('No AI provider configured. Add an API key to .env')
    provider = available[0].id
  }

  if (provider === 'gemini') return analyzeWithGemini(prompt)
  return analyzeWithClaude(prompt)
}
