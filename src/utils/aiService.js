/**
 * aiService.js
 * Unified AI service that supports both Gemini (browser-safe) and Anthropic (backend required).
 *
 * Gemini: Called directly from the browser using @google/generative-ai SDK.
 *         VITE_GEMINI_API_KEY must be set in .env
 *
 * Anthropic: Requires a backend proxy (CORS + key exposure risk).
 *            Falls back to mock streaming if no backend is configured.
 *            VITE_ANTHROPIC_API_KEY is used only for reference / future backend forwarding.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  ANTHROPIC: 'anthropic',
  MOCK: 'mock',
}

// Models tried in order — first available one wins.
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
]
const ANTHROPIC_MODEL = 'claude-sonnet-4-6'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(context = '') {
  return `You are an expert AI career advisor for software engineers. 
You analyze GitHub profiles, LeetCode stats, and career goals to give actionable, personalized advice.
Be concise, structured, and use markdown formatting (bold, bullets, headers) in your responses.
Context about the user: ${context}`
}

// ─── Gemini streaming ──────────────────────────────────────────────────────────

async function streamGemini({ prompt, context, onChunk, onDone, onError }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    onError(new Error('VITE_GEMINI_API_KEY is not set. Please add it to your .env file.'))
    return
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const fullPrompt = `${buildSystemPrompt(context)}\n\nUser: ${prompt}`
  const isQuotaOrNotFound = (err) =>
    err?.status === 429 || err?.status === 404 ||
    err?.message?.includes('429') || err?.message?.includes('404') ||
    err?.message?.includes('quota') || err?.message?.includes('not found')

  let lastError = null
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContentStream(fullPrompt)

      let accumulated = ''
      for await (const chunk of result.stream) {
        accumulated += chunk.text()
        onChunk(accumulated)
      }
      onDone(accumulated)
      return // success — stop trying further models
    } catch (err) {
      lastError = err
      if (isQuotaOrNotFound(err)) {
        // Before giving up on this model, try non-streaming generateContent
        // (same as what works in CodeXLive with the same key)
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          const result = await model.generateContent(fullPrompt)
          const text = result.response.text()
          // Simulate streaming word-by-word for consistent UX
          let accumulated = ''
          const words = text.split(' ')
          for (const word of words) {
            accumulated += (accumulated ? ' ' : '') + word
            onChunk(accumulated)
            await new Promise((r) => setTimeout(r, 15))
          }
          onDone(accumulated)
          return
        } catch (_) {
          // non-streaming also failed — try next model
          continue
        }
      }
      // Non-quota error (network, auth, etc.) — break immediately
      onError(err)
      return
    }
  }

  // All models exhausted — stream a friendly diagnostic
  const quota429 = lastError?.status === 429 || lastError?.message?.includes('429') || lastError?.message?.includes('quota')
  const diagMsg = quota429
    ? '⚠️ **All Gemini models are quota-limited for your project.**\n\n' +
      'Your Google AI Studio project shows `limit: 0` — meaning no free-tier quota is allocated. ' +
      'This is a **regional/project configuration issue**, not a usage issue.\n\n' +
      '**Steps to fix:**\n' +
      '1. Go to [aistudio.google.com/app/usage](https://aistudio.google.com/app/usage) → click **Rate Limit** in the left sidebar\n' +
      '2. Check if any model shows `0 RPM` — if yes, your project needs quota adjustment\n' +
      '3. Try creating a **new project** in AI Studio and generating a fresh API key for it\n' +
      '4. If you\'re in India, some Gemini models have regional restrictions — try `gemini-pro` via Vertex AI\n\n' +
      '**For now:** Switch the provider dropdown to **Mock (Demo)** to use simulated AI responses.'
    : `⚠️ **Gemini API error:** ${lastError?.message || 'Unknown error'}.\n\nSwitch to **Mock (Demo)** mode to continue testing.`

  let acc = ''
  simulateMockStream(diagMsg, (w) => { acc += w; onChunk(acc) }, () => onDone(acc))
}

// ─── Anthropic (backend proxy) streaming ────────────────────────────────────────

async function streamAnthropic({ prompt, context, onChunk, onDone, onError }) {
  // In production, replace this URL with your backend endpoint:
  //   POST /api/ai/chat → your server calls Anthropic SDK with claude-sonnet-4-6
  const backendUrl = import.meta.env.VITE_ANTHROPIC_BACKEND_URL || null

  if (!backendUrl) {
    onError(
      new Error(
        'Anthropic requires a backend proxy. Set VITE_ANTHROPIC_BACKEND_URL in .env, or use Gemini for direct browser access.'
      )
    )
    return
  }

  try {
    const res = await fetch(`${backendUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        context,
        model: ANTHROPIC_MODEL,
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      }),
    })

    if (!res.ok) throw new Error(`Backend error: ${res.statusText}`)
    if (!res.body) throw new Error('No response body from backend')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let accumulated = ''

    let reading = true
    while (reading) {
      const { done, value } = await reader.read()
      if (done) {
        reading = false
        break
      }
      const chunk = decoder.decode(value, { stream: true })
      accumulated += chunk
      onChunk(accumulated)
    }

    onDone(accumulated)
  } catch (err) {
    onError(err)
  }
}

// ─── Mock streaming (fallback) ────────────────────────────────────────────────

export function simulateMockStream(text, onChunk, onDone) {
  const words = text.split(' ')
  let i = 0
  const interval = setInterval(() => {
    if (i < words.length) {
      onChunk(words[i] + ' ')
      i++
    } else {
      clearInterval(interval)
      onDone()
    }
  }, 30)
  return () => clearInterval(interval)
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Stream a response from the selected AI provider.
 * @param {object} opts
 * @param {'gemini'|'anthropic'|'mock'} opts.provider
 * @param {string} opts.prompt          User message
 * @param {string} [opts.context]       Extra context string
 * @param {string} [opts.mockResponse]  Fallback text for mock mode
 * @param {function} opts.onChunk       Called with accumulated text on each chunk
 * @param {function} opts.onDone        Called when streaming completes
 * @param {function} opts.onError       Called with an Error object on failure
 */
export async function streamAIResponse({
  provider,
  prompt,
  context = '',
  mockResponse = '',
  onChunk,
  onDone,
  onError,
}) {
  if (provider === AI_PROVIDERS.GEMINI) {
    return streamGemini({ prompt, context, onChunk, onDone, onError })
  }

  if (provider === AI_PROVIDERS.ANTHROPIC) {
    return streamAnthropic({ prompt, context, onChunk, onDone, onError })
  }

  // Mock mode — word-by-word simulation
  let accumulated = ''
  simulateMockStream(
    mockResponse,
    (word) => {
      accumulated += word
      onChunk(accumulated)
    },
    () => onDone(accumulated)
  )
}

export const providerLabel = {
  [AI_PROVIDERS.GEMINI]: 'Gemini',
  [AI_PROVIDERS.ANTHROPIC]: 'Anthropic',
  [AI_PROVIDERS.MOCK]: 'Mock (Demo)',
}

export const providerDescription = {
  [AI_PROVIDERS.GEMINI]: 'Google Gemini — runs directly in the browser. Requires VITE_GEMINI_API_KEY.',
  [AI_PROVIDERS.ANTHROPIC]: 'Anthropic Claude — requires a backend proxy. Requires VITE_ANTHROPIC_BACKEND_URL.',
  [AI_PROVIDERS.MOCK]: 'Demo mode — simulated AI responses, no API key needed.',
}
