import { Transaction } from '@solana/web3.js'
import { defaultAnalysis } from '../data/demo'

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

function apiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
  if (configured) return configured
  return import.meta.env.PROD ? '' : null
}

async function responseError(response) {
  try {
    const body = await response.json()
    return body.error || `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

async function postToApi(path, body) {
  const baseUrl = apiBaseUrl()
  if (baseUrl === null) return null

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error(await responseError(response))
  return response.json()
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be prepared.')), 'image/jpeg', 0.84)
  })
}

async function resizeImage(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  canvas.getContext('2d', { alpha: false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvasBlob(canvas)
}

async function extractVideoFrame(file) {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'metadata'
  video.src = objectUrl

  try {
    await new Promise((resolve, reject) => {
      video.onloadeddata = resolve
      video.onerror = () => reject(new Error('The video preview could not be prepared.'))
    })
    if (Number.isFinite(video.duration) && video.duration > 0.2) {
      video.currentTime = Math.min(0.5, video.duration / 3)
      await new Promise((resolve) => { video.onseeked = resolve })
    }
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
    canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvasBlob(canvas)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function encodeMedia(file) {
  const blob = file.type.startsWith('video/') ? await extractVideoFrame(file) : await resizeImage(file)
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768))
  }
  return { mimeType: 'image/jpeg', data: btoa(binary) }
}

export async function analyzePhoto(file, dog) {
  if (apiBaseUrl() !== null) {
    try {
      const media = await encodeMedia(file)
      return await postToApi('/api/analyze', { ...media, dogName: dog?.name })
    } catch {
      // Keep the wellness ritual usable when a sponsor API is unavailable.
    }
  }

  await wait(1450)
  const filename = file.name.toLowerCase()
  const energetic = filename.includes('run') || filename.includes('play')
  return energetic
    ? {
        mood: 'Playful',
        energy_level: 9,
        posture_notes: 'Forward, springy stance',
        health_flags: ['none'],
        confidence: 0.89,
        voiceLine: 'I am ready to move. That toy does not stand a chance today.',
        provider: 'demo',
      }
    : { ...defaultAnalysis, provider: 'demo' }
}

export async function generateVoice(text) {
  const baseUrl = apiBaseUrl()
  if (baseUrl === null) return null
  try {
    const response = await fetch(`${baseUrl}/api/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error(await responseError(response))
    return { url: URL.createObjectURL(await response.blob()), provider: 'ElevenLabs' }
  } catch {
    return null
  }
}

export async function saveCheckin(checkin) {
  try {
    const remote = await postToApi('/api/checkins', checkin)
    if (remote) return remote
  } catch {
    // Local history is the durable fallback for an unavailable warehouse.
  }
  localStorage.setItem('barkpass:last-checkin', JSON.stringify(checkin))
  return { stored: 'local-demo', provider: 'demo' }
}

export async function saveDogProfile(dog) {
  try {
    const remote = await postToApi('/api/dogs', {
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      microchip: dog.microchip,
      vaccination: dog.vaccination,
    })
    if (remote) return remote
  } catch {
    // The local profile remains usable when Snowflake is unavailable.
  }
  return { stored: 'local-profile', provider: 'demo' }
}

export async function askHistory(question, checkins, dog) {
  try {
    const remote = await postToApi('/api/query', {
      dogId: dog.id,
      dogName: dog.name,
      question,
      checkins,
    })
    if (remote) return remote
  } catch {
    // Calculate the same transparent summary from this browser's history.
  }

  await wait(700)
  if (!checkins.length) throw new Error('No check-ins are available yet.')
  const values = checkins.map((item) => item.energy)
  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  const first = values[0]
  const last = values.at(-1)
  const direction = last > first ? 'up slightly' : last < first ? 'down slightly' : 'steady overall'
  const checkinLabel = `${checkins.length} check-in${checkins.length === 1 ? '' : 's'}`

  return {
    answer: `${dog.name} averaged ${average.toFixed(1)} out of 10 across ${checkinLabel}. Energy stayed between ${min} and ${max}, and finished ${direction} compared with the first saved day.`,
    facts: [checkinLabel, `Average ${average.toFixed(1)}`, `Range ${min} to ${max}`],
    provider: 'demo',
  }
}

export async function connectWallet() {
  if (window.solana?.isPhantom) {
    const response = await window.solana.connect()
    return { address: response.publicKey.toString(), provider: 'Phantom' }
  }
  await wait(650)
  return { address: 'Demo7gF4...82pa', provider: 'Demo wallet' }
}

export async function runChainAction(action, wallet, dog) {
  let remote = null
  try {
    remote = await postToApi(`/api/solana/${action}`, { wallet: wallet.address, dog })
  } catch {
    // Preserve an explicitly labeled demo result when devnet is unavailable.
  }
  if (remote?.transaction) {
    if (!window.solana?.isPhantom) throw new Error('Phantom is required to sign the shelter tip.')
    const bytes = Uint8Array.from(atob(remote.transaction), (character) => character.charCodeAt(0))
    const transaction = Transaction.from(bytes)
    const result = await window.solana.signAndSendTransaction(transaction)
    return {
      signature: result.signature,
      explorerUrl: `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`,
      mode: 'live',
    }
  }
  if (remote) return remote

  await wait(1000)
  if (action === 'mint') {
    return {
      signature: '3Y7VExjN5i9nU6ZPmjWW8nVW53ZWF7vJUX48EEQYtgWnmh9kmNiKTjknNNfxKatwUWs8RP2P4SnZ6vpbKzCdTi4m',
      explorerUrl: 'https://explorer.solana.com/address/AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3?cluster=devnet',
      mode: 'verified-example',
      message: 'Live devnet proof from BarkPass’s verified Luna passport.',
    }
  }
  return {
    mode: 'demo',
    message: 'Tip preparation is available in the protected live-provider demo. Phantom must approve the final devnet transaction.',
  }
}
