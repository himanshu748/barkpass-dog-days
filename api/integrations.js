import { json } from './_shared.js'

export default {
  fetch(request) {
    if (request.method !== 'GET') return json({ error: 'Use GET for this endpoint.' }, 405)
    return json({
      providers: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
        snowflake: Boolean(
          process.env.SNOWFLAKE_ACCOUNT
          && process.env.SNOWFLAKE_USER
          && (process.env.SNOWFLAKE_PRIVATE_KEY_BASE64 || process.env.SNOWFLAKE_PASSWORD)
        ),
        solana: Boolean(process.env.SOLANA_RPC && process.env.SOLANA_VAULT_KEY),
      },
    })
  },
}
