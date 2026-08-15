import { json, postOnly, readJson, requireEnv, safeMessage } from './_shared.js'

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['mood', 'energy_level', 'posture_notes', 'health_flags', 'confidence'],
  properties: {
    mood: { type: 'string', enum: ['anxious', 'relaxed', 'playful', 'alert', 'tired'] },
    energy_level: { type: 'integer', minimum: 1, maximum: 10 },
    posture_notes: { type: 'string' },
    health_flags: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function voiceLineFor(result) {
  const flag = result.health_flags.find((item) => item.toLowerCase() !== 'none')
  if (flag) return `I feel ${result.mood.toLowerCase()} today. You may want to take another look at ${flag.toLowerCase()}.`
  if (result.energy_level >= 8) return `I am feeling ${result.mood.toLowerCase()} and ready to move. Let us make room for a good walk today.`
  if (result.energy_level <= 4) return `I am feeling ${result.mood.toLowerCase()} and taking things slowly today. A quieter pace sounds good.`
  return `I am feeling ${result.mood.toLowerCase()} today, with enough energy for our usual rhythm.`
}

export default {
  async fetch(request) {
    const methodError = postOnly(request)
    if (methodError) return methodError

    try {
      const { mimeType, data, dogName: inputDogName } = await readJson(request)
      if (!mimeType?.startsWith('image/') || !data) return json({ error: 'A prepared image is required.' }, 400)
      if (data.length > 8_000_000) return json({ error: 'The prepared image is too large.' }, 413)
      const dogName = String(inputDogName || '').trim().slice(0, 50)

      const apiKey = requireEnv('GEMINI_API_KEY')
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are a careful veterinary behavior observer. Describe only visible signals. Never diagnose a condition or claim certainty about health. Return only the requested JSON.' }],
          },
          contents: [{
            role: 'user',
            parts: [
              { text: `Observe this dog check-in image${dogName ? ` for ${dogName}` : ''}. Estimate mood, energy, posture and visible flags. Use "none" when there is no specific visible flag.` },
              { inlineData: { mimeType, data } },
            ],
          }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseJsonSchema: schema,
          },
        }),
      })

      if (!response.ok) throw new Error(`Gemini returned ${response.status}.`)
      const body = await response.json()
      const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
      if (!text) throw new Error('Gemini returned no analysis.')
      const raw = JSON.parse(text)
      const result = {
        mood: titleCase(raw.mood),
        energy_level: Math.max(1, Math.min(10, Number(raw.energy_level))),
        posture_notes: String(raw.posture_notes).slice(0, 180),
        health_flags: Array.isArray(raw.health_flags) && raw.health_flags.length ? raw.health_flags.map(String).slice(0, 4) : ['none'],
        confidence: Math.max(0, Math.min(1, Number(raw.confidence))),
        provider: 'gemini',
      }
      return json({ ...result, voiceLine: voiceLineFor(result) })
    } catch (error) {
      console.error('Gemini analysis failed:', error instanceof Error ? error.message : error)
      return json({ error: safeMessage(error, 'Gemini could not analyze this check-in. Try the photo again.') }, 502)
    }
  },
}
