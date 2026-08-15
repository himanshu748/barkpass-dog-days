---
title: "Your dog's camera roll is a wellness history. BarkPass makes it speak."
published: false
tags: devchallenge, weekendchallenge, ai, webdev
---

*This is a submission for [Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13).*

Dog owners take hundreds of photos, then rely on memory for the question that matters: **has anything changed?**

Yesterday's posture, last week's energy, that unusually restless look. Each clue is visible for a moment, then buried between screenshots and receipts. A single photo is a memory. A sequence of photos can become a wellness history.

**BarkPass makes that history queryable, audible and portable.**

One daily photo becomes a structured visual observation, a short voice update spoken as the dog, a grounded history the owner can question, and an optional on-chain pet passport. BarkPass describes what is visible. It never diagnoses a condition or replaces a veterinarian.

## What I Built

BarkPass is a responsive wellness companion for any dog. Its product loop is **notice, hear, remember, carry**.

1. Create a profile for your dog.
2. Add today's photo or a short video.
3. Gemini returns a structured read of visible mood, energy, posture and flags.
4. ElevenLabs turns that result into a short first-person voice note.
5. Snowflake stores the check-in and grounds plain-language trend answers in the rows that actually exist.
6. Solana turns the dog's identity details into a portable, independently verifiable devnet passport.

Bruno is the editorial example on the landing page, not a hardcoded user. Every new visitor receives a random dog ID. That ID scopes the profile, check-ins, Snowflake history queries and Solana metadata. Start at `/app` and BarkPass is about your dog, not mine.

## Try BarkPass

🔗 **Create a BarkPass for your dog:** https://barkpass-dog-days.vercel.app/app

🔗 **Explore Bruno's optional sample story:** https://barkpass-dog-days.vercel.app/app?sample=1

🔗 **Read the source:** https://github.com/himanshu748/barkpass-dog-days

The clean app route begins with onboarding. Add a real dog profile, choose a photo, inspect the structured observation, play the voice note, ask a history question and open the passport section.

The Bruno route is only an optional sample story. A history product needs several days before its most interesting screen makes sense, so the sample provides seven check-ins immediately. It is not a separate build or a hidden judging route.

![BarkPass personalized daily check-in for Milo with all four provider routes live, plus visible mood, energy, posture and voice results](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/e48550f/submission-assets/02-app-checkin.png)

## The product flow

The first check-in begins in the browser. BarkPass downsizes an image to a maximum edge of 1,600 pixels, or extracts one representative frame from a short video. This reduces upload time and keeps the provider payload bounded. The prepared JPEG is sent only after the owner chooses the file.

Gemini returns a structured observation. BarkPass saves the normalized result as a check-in, then uses the same result to prepare the dog's voice note. Each additional check-in extends the dog's history. The owner can ask a plain-language question such as "Has Luna's energy changed this week?" and receive an answer calculated from Luna's queried Snowflake rows.

The passport is a separate, optional action. It carries identity and care details, not the owner's private image history. Minting returns public Solana Explorer proof. A shelter tip is prepared as an unsigned devnet transaction and still requires the owner to approve it in Phantom.

The product stays useful even when one provider is unavailable. Local profile and check-in history continue to work. Every non-provider result is labelled in the interface so sample data is never presented as live sponsor output.

## The architecture, end to end

The four integrations are stages of one pipeline, not four logos attached to a landing page.

![BarkPass architecture: notice with Gemini, hear with ElevenLabs, remember with Snowflake and carry with Solana](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/e48550f/submission-assets/05-architecture.png)

The diagram is a static 1,280 × 720 image so it renders consistently on DEV without depending on Mermaid support.

### The five layers

| Layer | Responsibility | What crosses the boundary |
| --- | --- | --- |
| React client | Dog profile state, media preparation, check-in UI, audio playback, Phantom connection and labelled local resilience | A prepared JPEG, normalized observation records, dog identity fields and owner-approved wallet actions |
| Vercel Functions | Validation, provider orchestration, normalization and credential isolation | Only the minimum provider-specific payload; no provider secret is returned to the browser |
| Google AI + ElevenLabs | Convert one selected frame into structured visible signals, then convert a bounded sentence into audio | Gemini receives the prepared frame; ElevenLabs receives the derived sentence, never the photo |
| Snowflake | Durable dog profiles, idempotent check-ins and dog-scoped trend queries | Text identity fields and structured observations; the original profile/check-in photo is not stored there |
| Solana devnet | Public passport metadata, one-of-one mint proof and unsigned shelter-tip preparation | Selected passport identity fields and the connected public wallet address |

### One check-in request sequence

1. **Prepare in the browser.** A chosen photo is resized to a maximum edge of 1,600 pixels and encoded as JPEG at 0.84 quality. For a short video, BarkPass seeks to an early representative frame and sends that frame rather than the whole clip. Nothing leaves the browser before the owner chooses media.
2. **Observe through `POST /api/analyze`.** The function checks the method, media type and payload size before calling `gemini-2.5-flash`. Gemini is constrained to a JSON schema. The function parses and normalizes the response again, clamps energy and confidence to their allowed ranges, caps visible flags, and derives the bounded voice sentence on the server.
3. **Speak through `POST /api/voice`.** Only that short sentence is sent to ElevenLabs. The function limits it to 500 characters and returns private-cacheable `audio/mpeg`; the browser creates a temporary object URL for playback.
4. **Remember through `POST /api/dogs` and `POST /api/checkins`.** Snowflake receives the current random `dog_id`, profile fields and the normalized observation. `MERGE` makes profile and check-in retries idempotent instead of duplicating history.
5. **Answer through `POST /api/query`.** The function synchronizes at most 30 recent local check-ins, selects only rows for the requested `dog_id`, and computes the row count, average, range, direction and most common mood from the returned values. The prose is assembled from those facts; an unrestricted model does not invent the trend answer.
6. **Carry through `POST /api/solana/mint`.** The server validates the current dog, creates a same-origin metadata URL and uses Metaplex to mint a one-of-one `BARK` token on devnet. The response returns both the mint and transaction Explorer URLs.
7. **Preserve owner control through `POST /api/solana/tip`.** The server builds a 0.01 SOL devnet transfer with the connected wallet as fee payer, but deliberately does not sign it. The browser hands the serialized transaction to Phantom; only the owner can approve and broadcast it.

### Identity and data isolation

The same random dog ID is the join key across browser storage, `BARKPASS_DOGS`, `BARKPASS_CHECKINS`, history queries and passport metadata. It is generated when a real profile is created and preserved when that profile is edited. Replacing the optional Bruno sample clears every sample-only field and creates a fresh ID, so a new owner cannot inherit Bruno's photo, microchip, vaccination or seven-day history.

Snowflake has two durable entities:

```text
BARKPASS_DOGS     dog_id → name, breed, age, microchip, vaccination
BARKPASS_CHECKINS (checkin_id, dog_id) → date, mood, energy,
                    posture, flags, confidence, summary
```

The compound check-in key matters: `checkin_id` makes retries safe, while `dog_id` prevents one dog's retry from overwriting another dog's record. Query parameters are bound rather than concatenated, and history reads always include `WHERE dog_id = ?`.

### Trust boundaries and failure behavior

The browser is treated as public. Gemini, ElevenLabs, Snowflake and Solana credentials exist only in Vercel's server environment. Functions validate and bound every incoming field before a provider call. Snowflake uses RSA key-pair authentication through a dedicated least-privilege service role, while the Solana authority is limited to devnet. The shelter-tip path is intentionally split: the server can prepare a transaction, but Phantom retains the owner's signing authority.

Each client adapter also has an explicit resilience boundary. If vision is unavailable, a clearly labelled sample observation keeps the interface demonstrable. If voice fails, device speech can keep the ritual audible. If Snowflake is unavailable, the current browser retains local history and computes the same transparent statistics. On-chain actions never pretend to succeed: live responses return Explorer evidence, verified examples are labelled as examples, and a real tip cannot leave the wallet without Phantom.

This separation is what lets BarkPass degrade one capability without collapsing the whole daily check-in—and without presenting fallback output as live sponsor output.

## How Google AI observes without pretending to diagnose

Gemini does not receive a vague "how is this dog feeling?" prompt. The server gives it a narrow role: careful veterinary behavior observer. It may describe only visible signals, must avoid diagnosis and must return JSON matching a strict schema.

```js
const schema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'mood',
    'energy_level',
    'posture_notes',
    'health_flags',
    'confidence',
  ],
  properties: {
    mood: {
      type: 'string',
      enum: ['anxious', 'relaxed', 'playful', 'alert', 'tired'],
    },
    energy_level: { type: 'integer', minimum: 1, maximum: 10 },
    posture_notes: { type: 'string' },
    health_flags: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
  },
}
```

The endpoint uses Gemini's JSON response mode with temperature `0.2`, then normalizes every field again before rendering it. The closed mood vocabulary and numeric bounds make daily observations comparable. A paragraph that changes tone every day would be difficult to chart or query. A stable record is useful.

The most important product rule is: **describe the frame, do not invent the dog.** A low confidence score stays visible. A visible flag becomes a reason to look again, not a medical conclusion.

I ran five licensed dog photographs through the live provider path. Gemini returned four distinct moods and energy values from 4 to 9.

| Photo | Mood | Energy | Confidence | API latency |
| --- | --- | ---: | ---: | ---: |
| 1 | Playful | 6/10 | 0.80 | 10.53 s |
| 2 | Playful | 9/10 | 0.90 | 4.30 s |
| 3 | Anxious | 4/10 | 0.40 | 8.38 s |
| 4 | Relaxed | 7/10 | 0.90 | 6.81 s |
| 5 | Alert | 7/10 | 0.80 | 4.68 s |

Average Gemini latency was 6.94 seconds. The test matters because a vision feature that returns "happy dog" for every photograph is only decoration.

## Why ElevenLabs is more than a play button

A score is useful. A sentence is memorable.

BarkPass turns the normalized observation into one short first-person line. High energy produces a more active suggestion. Low energy produces a quieter one. A visible flag asks the owner to take another look without claiming a diagnosis. That bounded line is sent to ElevenLabs using `eleven_flash_v2_5` and returned as a 44.1 kHz, 128 kbps MP3.

A timed live call produced an 84,889-byte MP3 in 1.55 seconds. The final Production recheck returned HTTP 200 with a playable 52,288-byte MPEG; output size varies with the generated sentence. Combined with the slowest timed Gemini call, the measured provider path was 12.08 seconds, inside the brief's 15-second target.

If the provider cannot respond, BarkPass can use device speech so the daily ritual does not dead-end. The interface labels that output as a fallback. Device speech is resilience, not evidence of ElevenLabs usage. The provider-backed measurement and playable MP3 are the evidence.

That distinction matters because BarkPass is not claiming to translate dogs. The voice is an interface for recall. Owners are more likely to remember "I am taking things slowly today" than a row containing `energy_level: 4`.

## Why Snowflake is the product's memory

One observation is a moment. Several observations become a pattern.

Profiles are merged into `BARKPASS_DOGS`. Check-ins are merged into `BARKPASS_CHECKINS` using both `checkin_id` and `dog_id`. The compound match makes retries idempotent and prevents a repeated save from creating duplicate history.

```sql
MERGE INTO BARKPASS_CHECKINS AS target
USING (...) AS source
ON target.checkin_id = source.checkin_id
AND target.dog_id = source.dog_id
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT (...)
```

History questions query only the requested dog's rows:

```sql
SELECT checkin_date, mood, energy_level, health_flags, summary_text
FROM BARKPASS_CHECKINS
WHERE dog_id = ?
ORDER BY checkin_date DESC
LIMIT 30
```

The returned sentence is calculated from those energy values and mood counts. BarkPass reports the row count, average and range beside the answer. It cannot invent a trend that is absent from the query result.

The deployment uses an X-Small auto-suspending warehouse and a dedicated service user. Key-pair authentication is preferred over a password, and the runtime role is limited to BarkPass's database, schema, tables and warehouse.

In live Production verification, BarkPass stored Maple and three check-ins with energy values 5, 7 and 8. The API reported an average of 6.7, a range of 5 to 8 and a higher final value. A fresh Snowflake worksheet aggregate independently returned the same row count, average, minimum and maximum.

![Fresh Snowflake worksheet aggregate for Maple's three Production check-ins](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/e48550f/submission-assets/03-snowflake-result.jpg)

Snowflake is not an analytics screenshot added after the product. It is why BarkPass can answer **"Has her energy changed?"** with the supporting numbers beside the sentence.

## Why Solana carries the passport

A pet passport is more useful when it is not trapped inside one application's database.

The mint endpoint validates the dog first, then generates a public metadata URL containing name, breed, age, microchip ID and vaccination date. Metaplex creates a one-of-one NFT on Solana devnet with symbol `BARK`, zero royalties and BarkPass's server vault as the mint authority.

Maple's BarkPass was minted from the public Production route as [`B3FRp9ndjjiVbFwb7MKruabsHicPQQCnL6JdksErEWwa`](https://explorer.solana.com/address/B3FRp9ndjjiVbFwb7MKruabsHicPQQCnL6JdksErEWwa?cluster=devnet). The [mint transaction](https://explorer.solana.com/tx/5nAjwN21Phz6Deia5uYzGCaRkD5v7xm7cjK5pA3JJWAQciPB357hmeQb5UKpzmzwFSRWbpMKrbpZrdJTnXMfHjWu?cluster=devnet) finalized without error. Explorer shows the `BARK` non-fungible token, Maple's public metadata URL and BarkPass's new funded devnet vault as authority.

![Finalized BarkPass mint transaction on Solana devnet](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/e48550f/submission-assets/04-solana-finalized.png)

The shelter-tip endpoint does something deliberately different. It prepares a 0.01 SOL devnet transfer with the connected wallet as fee payer, but the server does not sign for the owner. Phantom receives the serialized transaction and must explicitly approve it before broadcast.

Devnet SOL has no monetary value. The proof is the verifiable lifecycle: generate dog-specific metadata, mint once, return Explorer evidence and preserve wallet approval for a transfer.

## The hardest engineering decisions

### Making the app about every dog, not Bruno

The landing page needed a memorable dog, but the product could not inherit that dog's identity. Profile creation now generates a random dog ID. Check-ins are stored under that ID in the browser and in Snowflake. Passport metadata is created from the current profile. A contract test specifically asks for Luna's history and fails if Bruno appears anywhere in the response.

### Keeping a four-provider flow understandable

It would have been easy to show four independent buttons. That would satisfy a checklist but create no product. BarkPass instead gives each provider one job in a single narrative: Gemini notices, ElevenLabs gives the moment a voice, Snowflake remembers and Solana lets the passport travel.

### Designing honest failure states

Provider credentials stay in server environments. The public deployment does not expose billable keys to the browser. If a provider is unavailable, BarkPass keeps local history usable and labels the resulting source. It never paints a fallback response as live AI, Snowflake or on-chain activity.

### Making a weekend build feel complete

The app supports photo and short-video input, loading, empty, success and error states, keyboard focus, reduced motion, 390-pixel mobile layouts and desktop layouts. The first-run reveal transition was browser-tested after it briefly produced a blank dashboard. The Solana function bundle also needed `rpc-websockets` pinned to `9.3.8` so Vercel's CommonJS build received a compatible `uuid` release.

## Privacy, safety and reliability boundaries

* Profile photos stay in the owner's browser.
* A prepared check-in frame is sent only after the owner selects a file.
* Text profile details and check-ins sync to Snowflake when that route is available.
* Dog IDs scope every profile, query and passport.
* Local profiles and history remain usable when a provider is unavailable.
* Fallbacks and sample data are explicitly labelled.
* Passport minting uses Solana devnet.
* Shelter tips require Phantom approval.
* BarkPass is a wellness companion, not veterinary advice.

The public client bundle is intentionally secret-free. All four real provider paths now run through the public Production deployment's same-origin server functions, while the repository contains the complete server implementation and reproducible verification record. No provider key, Snowflake private key or Solana vault secret is shipped to the browser.

## How I tested it

The Node test suite covers provider contracts and the isolation boundaries that would be easiest to get wrong:

* Gemini JSON normalization and the generated voice line
* playable ElevenLabs audio bytes
* incomplete Snowflake check-in rejection
* Snowflake key-pair authentication without password exposure
* integration status with key-pair credentials
* dog profile validation
* dog-specific history with no Bruno inheritance
* dynamic Solana metadata for the requested dog
* validation before any mint creates chain state

Run the same checks locally:

```bash
npm install
npm test
npm run build
```

All thirteen contract tests pass. The production Vite build passes. I also verified the first-run flow, sample-to-personal profile isolation, the optional seven-day sample, responsive behavior at 390 pixels, public metadata, the finalized devnet mint, a playable ElevenLabs MP3, the five-photo Gemini set and Snowflake's independent aggregate.

## Run it yourself

Clone the repository and copy the environment contract:

```bash
git clone https://github.com/himanshu748/barkpass-dog-days.git
cd barkpass-dog-days
cp .env.example .env.local
npm install
npm run dev
```

The interface works locally with labelled resilience paths. To exercise live providers, configure the values documented in `.env.example` and point `VITE_API_BASE_URL` at a running functions deployment. The core server variables are:

```text
GEMINI_API_KEY
ELEVENLABS_API_KEY
SNOWFLAKE_ACCOUNT
SNOWFLAKE_USER
SNOWFLAKE_PRIVATE_KEY_BASE64
SNOWFLAKE_WAREHOUSE
SNOWFLAKE_DATABASE
SNOWFLAKE_SCHEMA
SOLANA_RPC
SOLANA_VAULT_KEY
```

Real values belong only in local or deployment secrets. They must never be committed.

## Prize Categories

I am entering BarkPass for **Overall Winner, Best Use of Google AI, Best Use of ElevenLabs, Best Use of Snowflake and Best Use of Solana**.

The theme connection is direct: the whole product begins with a dog owner's daily photo. The creative choice is to turn that familiar habit into something the owner can hear, question and carry. The technical execution is the connected pipeline and its source boundaries, not the number of APIs used.

## Known limitations

BarkPass is a weekend prototype, not a clinical product. Visual observations can be wrong, which is why confidence stays visible and the language remains non-diagnostic. The Production app has all four provider routes configured, while labelled local resilience keeps a check-in usable during a provider outage. The shelter-tip transaction has been prepared successfully, but final broadcast still requires an owner's Phantom approval. There is no account system or multi-device sync yet.

These are explicit boundaries, not hidden promises.

## What comes next

The next version would add authenticated multi-device profiles, owner-controlled sharing with carers or veterinarians, reminders, exportable wellness summaries and rate-limited public provider routes. I would also evaluate Gemini against a larger, more diverse photo set and make the passport updateable through an owner-controlled authority.

Most pet apps begin by asking owners to become better record keepers. BarkPass begins with something they already do: take a photo.

That small habit becomes a story they can hear, question and carry with their dog.
