import { json, postOnly, readJson, requireEnv, safeMessage } from './_shared.js'

export default {
  async fetch(request) {
    const methodError = postOnly(request)
    if (methodError) return methodError

    try {
      const { text } = await readJson(request)
      if (!text?.trim()) return json({ error: 'Voice text is required.' }, 400)
      const apiKey = requireEnv('ELEVENLABS_API_KEY')
      const model = process.env.ELEVENLABS_MODEL || 'eleven_flash_v2_5'
      const voiceId = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.trim().slice(0, 500),
          model_id: model,
          voice_settings: { stability: 0.54, similarity_boost: 0.72, style: 0.18, use_speaker_boost: true },
        }),
      })
      if (!response.ok) throw new Error(`ElevenLabs returned ${response.status}.`)
      return new Response(await response.arrayBuffer(), {
        headers: {
          'content-type': 'audio/mpeg',
          'cache-control': 'private, max-age=300',
          'x-barkpass-provider': 'ElevenLabs',
        },
      })
    } catch (error) {
      console.error('ElevenLabs voice failed:', error instanceof Error ? error.message : error)
      return json({ error: safeMessage(error, 'ElevenLabs could not prepare this dog’s voice.') }, 502)
    }
  },
}
