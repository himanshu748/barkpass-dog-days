import { json, postOnly, readJson, safeMessage } from './_shared.js'
import { execute, upsertCheckin, withSnowflake } from './_snowflake.js'
import { normalizeDogId } from './_dog.js'

function numeric(row, key) {
  return Number(row[key] ?? row[key.toLowerCase()] ?? 0)
}

function text(row, key) {
  return String(row[key] ?? row[key.toLowerCase()] ?? '')
}

export function summarize(question, rows, dogName) {
  const chronological = [...rows].reverse()
  const values = chronological.map((row) => numeric(row, 'ENERGY_LEVEL'))
  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  const first = values[0]
  const last = values.at(-1)
  const direction = last > first ? 'finished higher' : last < first ? 'finished lower' : 'finished steady'
  const moodCounts = rows.reduce((counts, row) => {
    const mood = text(row, 'MOOD') || 'Unknown'
    counts[mood] = (counts[mood] || 0) + 1
    return counts
  }, {})
  const commonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  const asksMood = /mood|feeling|relax|playful|tired|alert/i.test(question)
  const checkinLabel = `${rows.length} Snowflake check-in${rows.length === 1 ? '' : 's'}`

  return {
    answer: asksMood
      ? `${dogName}’s most common recorded mood was ${commonMood.toLowerCase()}. Across ${checkinLabel}, the average energy was ${average.toFixed(1)} out of 10.`
      : `Across ${checkinLabel}, ${dogName} averaged ${average.toFixed(1)} out of 10. Energy ranged from ${min} to ${max} and ${direction} compared with the first saved day.`,
    facts: [checkinLabel, `Average ${average.toFixed(1)}`, `Range ${min} to ${max}`],
  }
}

export default {
  async fetch(request) {
    const methodError = postOnly(request)
    if (methodError) return methodError

    try {
      const { dogId: inputDogId, dogName: inputDogName, question, checkins = [] } = await readJson(request)
      const dogId = normalizeDogId(inputDogId)
      const dogName = String(inputDogName || 'Your dog').trim().slice(0, 50) || 'Your dog'
      if (!question?.trim()) return json({ error: `Ask a question about ${dogName}’s history.` }, 400)

      const rows = await withSnowflake(async (connection, table) => {
        for (const checkin of checkins.slice(-30)) await upsertCheckin(connection, table, { ...checkin, dogId })
        const result = await execute(connection, `
          SELECT checkin_date, mood, energy_level, health_flags, summary_text
          FROM ${table}
          WHERE dog_id = ?
          ORDER BY checkin_date DESC
          LIMIT 30
        `, [dogId])
        return result.rows
      })

      if (!rows.length) return json({ error: 'No Snowflake check-ins are available yet.' }, 404)
      return json({ ...summarize(question, rows, dogName), provider: 'snowflake' })
    } catch (error) {
      console.error('Snowflake query failed:', error instanceof Error ? error.message : error)
      const message = safeMessage(error, 'Snowflake could not read this dog’s history. Try again.')
      return json({ error: message }, /required|invalid/i.test(message) ? 400 : 502)
    }
  },
}
