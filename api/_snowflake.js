import snowflake from 'snowflake-sdk'
import { requireEnv } from './_shared.js'

const tableName = /^[A-Za-z_][A-Za-z0-9_$]*$/.test(process.env.SNOWFLAKE_CHECKINS_TABLE || '')
  ? process.env.SNOWFLAKE_CHECKINS_TABLE
  : 'BARKPASS_CHECKINS'

const dogsTableName = /^[A-Za-z_][A-Za-z0-9_$]*$/.test(process.env.SNOWFLAKE_DOGS_TABLE || '')
  ? process.env.SNOWFLAKE_DOGS_TABLE
  : 'BARKPASS_DOGS'

function connect() {
  const connection = snowflake.createConnection({
    account: requireEnv('SNOWFLAKE_ACCOUNT'),
    username: requireEnv('SNOWFLAKE_USER'),
    password: requireEnv('SNOWFLAKE_PASSWORD'),
    warehouse: requireEnv('SNOWFLAKE_WAREHOUSE'),
    database: requireEnv('SNOWFLAKE_DATABASE'),
    schema: requireEnv('SNOWFLAKE_SCHEMA'),
    application: 'BARKPASS_DEV_WEEKEND',
  })

  return new Promise((resolve, reject) => {
    connection.connect((error) => error ? reject(error) : resolve(connection))
  })
}

export function execute(connection, sqlText, binds = []) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete(error, statement, rows) {
        if (error) reject(error)
        else resolve({ statement, rows: rows || [] })
      },
    })
  })
}

async function ensureTable(connection) {
  await Promise.all([
    execute(connection, `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        checkin_id STRING,
        dog_id STRING,
        checkin_date DATE,
        mood STRING,
        energy_level INT,
        health_flags ARRAY,
        posture_notes STRING,
        confidence FLOAT,
        summary_text STRING,
        created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
      )
    `),
    execute(connection, `
      CREATE TABLE IF NOT EXISTS ${dogsTableName} (
        dog_id STRING,
        dog_name STRING,
        breed STRING,
        age STRING,
        microchip STRING,
        vaccination STRING,
        created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
        updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
      )
    `),
  ])
}

function close(connection) {
  return new Promise((resolve) => {
    connection.destroy(() => resolve())
  })
}

export async function withSnowflake(run) {
  const connection = await connect()
  try {
    await ensureTable(connection)
    return await run(connection, tableName)
  } finally {
    await close(connection)
  }
}

export async function upsertCheckin(connection, table, checkin) {
  const flags = Array.isArray(checkin.flags) && checkin.flags.length ? checkin.flags : ['none']
  const binds = [
    String(checkin.id),
    String(checkin.dogId),
    String(checkin.isoDate || new Date().toISOString().slice(0, 10)),
    String(checkin.mood || 'Unknown'),
    Number(checkin.energy || 0),
    JSON.stringify(flags),
    String(checkin.postureNotes || ''),
    Number(checkin.confidence || 0),
    String(checkin.summaryText || `${checkin.mood || 'Unknown'}, energy ${checkin.energy || 0} out of 10.`),
  ]

  await execute(connection, `
    MERGE INTO ${table} AS target
    USING (
      SELECT
        ? AS checkin_id,
        ? AS dog_id,
        TO_DATE(?) AS checkin_date,
        ? AS mood,
        ? AS energy_level,
        PARSE_JSON(?) AS health_flags,
        ? AS posture_notes,
        ? AS confidence,
        ? AS summary_text
    ) AS source
    ON target.checkin_id = source.checkin_id AND target.dog_id = source.dog_id
    WHEN MATCHED THEN UPDATE SET
      mood = source.mood,
      energy_level = source.energy_level,
      health_flags = source.health_flags,
      posture_notes = source.posture_notes,
      confidence = source.confidence,
      summary_text = source.summary_text
    WHEN NOT MATCHED THEN INSERT (
      checkin_id, dog_id, checkin_date, mood, energy_level, health_flags,
      posture_notes, confidence, summary_text, created_at
    ) VALUES (
      source.checkin_id, source.dog_id, source.checkin_date, source.mood,
      source.energy_level, source.health_flags, source.posture_notes,
      source.confidence, source.summary_text, CURRENT_TIMESTAMP()
    )
  `, binds)
}

export async function upsertDogProfile(connection, dog) {
  await execute(connection, `
    MERGE INTO ${dogsTableName} AS target
    USING (
      SELECT
        ? AS dog_id,
        ? AS dog_name,
        ? AS breed,
        ? AS age,
        ? AS microchip,
        ? AS vaccination
    ) AS source
    ON target.dog_id = source.dog_id
    WHEN MATCHED THEN UPDATE SET
      dog_name = source.dog_name,
      breed = source.breed,
      age = source.age,
      microchip = source.microchip,
      vaccination = source.vaccination,
      updated_at = CURRENT_TIMESTAMP()
    WHEN NOT MATCHED THEN INSERT (
      dog_id, dog_name, breed, age, microchip, vaccination, created_at, updated_at
    ) VALUES (
      source.dog_id, source.dog_name, source.breed, source.age,
      source.microchip, source.vaccination, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()
    )
  `, [dog.id, dog.name, dog.breed, dog.age, dog.microchip, dog.vaccination])
}
