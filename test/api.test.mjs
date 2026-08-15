import test from 'node:test'
import assert from 'node:assert/strict'
import analyze from '../api/analyze.js'
import voice from '../api/voice.js'
import checkins from '../api/checkins.js'
import dogs from '../api/dogs.js'
import metadata from '../api/passport-metadata.js'
import mint from '../api/solana/mint.js'
import { summarize } from '../api/query.js'

test('Gemini route normalizes a structured visual read', async () => {
  const originalFetch = globalThis.fetch
  process.env.GEMINI_API_KEY = 'test-key'
  process.env.GEMINI_MODEL = 'test-model'
  globalThis.fetch = async () => new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify({
      mood: 'playful',
      energy_level: 9,
      posture_notes: 'Forward and springy',
      health_flags: ['none'],
      confidence: 0.91,
    }) }] } }],
  }), { status: 200, headers: { 'content-type': 'application/json' } })

  try {
    const response = await analyze.fetch(new Request('https://barkpass.test/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mimeType: 'image/jpeg', data: 'ZmFrZQ==', dogName: 'Luna' }),
    }))
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.provider, 'gemini')
    assert.equal(body.mood, 'Playful')
    assert.equal(body.energy_level, 9)
    assert.match(body.voiceLine, /ready to move/i)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('ElevenLabs route returns playable audio bytes', async () => {
  const originalFetch = globalThis.fetch
  process.env.ELEVENLABS_API_KEY = 'test-key'
  globalThis.fetch = async () => new Response(Uint8Array.from([73, 68, 51]), {
    status: 200,
    headers: { 'content-type': 'audio/mpeg' },
  })

  try {
    const response = await voice.fetch(new Request('https://barkpass.test/api/voice', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: 'I am ready for our walk.' }),
    }))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'audio/mpeg')
    assert.equal((await response.arrayBuffer()).byteLength, 3)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('Snowflake route validates incomplete check-ins before connecting', async () => {
  const response = await checkins.fetch(new Request('https://barkpass.test/api/checkins', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mood: 'Relaxed' }),
  }))
  assert.equal(response.status, 400)
})

test('Dog profiles validate before Snowflake connects', async () => {
  const response = await dogs.fetch(new Request('https://barkpass.test/api/dogs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id: 'dog_luna_123', name: '', breed: 'Indie' }),
  }))
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /name is required/i)
})

test('History summaries use the requested dog and never inherit Bruno', () => {
  const result = summarize('How is her mood?', [
    { MOOD: 'Relaxed', ENERGY_LEVEL: 6 },
    { MOOD: 'Playful', ENERGY_LEVEL: 8 },
  ], 'Luna')
  assert.match(result.answer, /Luna’s most common recorded mood/i)
  assert.doesNotMatch(result.answer, /Bruno/i)
})

test('Solana metadata is generated for the requested dog', async () => {
  const url = new URL('https://barkpass.test/api/passport-metadata')
  Object.entries({
    id: 'dog_luna_123',
    name: 'Luna',
    breed: 'Indian Pariah',
    age: '3 years',
    microchip: 'chip-9021',
    vaccination: 'July 2, 2026',
  }).forEach(([key, value]) => url.searchParams.set(key, value))
  const response = metadata.fetch(new Request(url, {
    headers: { host: 'barkpass.test', 'x-forwarded-proto': 'https' },
  }))
  const body = await response.json()
  assert.equal(body.name, "Luna's BarkPass")
  assert.match(body.image, /barkpass-passport\.svg$/)
  assert.equal(body.attributes[0].value, 'Indian Pariah')
  assert.equal(body.attributes.length, 5)
})

test('Solana mint validates a dog before creating on-chain state', async () => {
  const response = await mint.fetch(new Request('https://barkpass.test/api/solana/mint', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dog: { name: 'Luna', breed: 'Indian Pariah' } }),
  }))
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /dog ID is required/i)
})
