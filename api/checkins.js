import { json, postOnly, readJson, safeMessage } from './_shared.js'
import { upsertCheckin, withSnowflake } from './_snowflake.js'
import { normalizeDogId } from './_dog.js'

export default {
  async fetch(request) {
    const methodError = postOnly(request)
    if (methodError) return methodError

    try {
      const checkin = await readJson(request)
      if (!checkin.id || !checkin.mood || !Number.isFinite(Number(checkin.energy))) {
        return json({ error: 'A complete check-in is required.' }, 400)
      }
      checkin.dogId = normalizeDogId(checkin.dogId)
      await withSnowflake((connection, table) => upsertCheckin(connection, table, checkin))
      return json({ stored: 'snowflake', provider: 'snowflake', checkinId: checkin.id })
    } catch (error) {
      console.error('Snowflake check-in failed:', error instanceof Error ? error.message : error)
      const message = safeMessage(error, 'Snowflake could not save this check-in. Try again.')
      return json({ error: message }, /required|invalid/i.test(message) ? 400 : 502)
    }
  },
}
