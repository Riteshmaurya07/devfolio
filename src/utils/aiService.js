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

const GEMINI_MODEL = 'gemini-2.0-flash'
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
  if (!apiKey) {
    onError(new Error('VITE_GEMINI_API_KEY is not set. Please add it to your .env file.'))
    return
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    const fullPrompt = `${buildSystemPrompt(context)}\n\nUser: ${prompt}`
    const result = await model.generateContentStream(fullPrompt)

    let accumulated = ''
    for await (const chunk of result.stream) {
      const text = chunk.text()
      accumulated += text
      onChunk(accumulated)
    }
    onDone(accumulated)
  } catch (err) {
    onError(err)
  }
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

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
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
