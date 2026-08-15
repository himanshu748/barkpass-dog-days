import { normalizeDog } from './_dog.js'
import { upsertDogProfile, withSnowflake } from './_snowflake.js'
import { json, postOnly, readJson, safeMessage } from './_shared.js'

export default {
  async fetch(request) {
    const methodError = postOnly(request)
    if (methodError) return methodError

    try {
      const dog = normalizeDog(await readJson(request))
      await withSnowflake((connection) => upsertDogProfile(connection, dog))
      return json({ stored: 'snowflake', provider: 'snowflake', dog })
    } catch (error) {
      console.error('Snowflake dog profile failed:', error instanceof Error ? error.message : error)
      const message = safeMessage(error, 'Snowflake could not save this dog profile. Try again.')
      const status = /required|invalid/i.test(message) ? 400 : 502
      return json({ error: message }, status)
    }
  },
}
