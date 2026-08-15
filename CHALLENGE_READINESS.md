# DEV Weekend challenge readiness

This review uses the BarkPass product brief supplied with the project. Official Devpost rules and judging weights were not fetched because this workspace has no `.devpost-hackathon-state.json`. Run `$start-hackathon` before treating any rules summary as official.

## Working criteria

| Track | Brief acceptance criterion | BarkPass implementation | Verification state |
| --- | --- | --- | --- |
| Overall | A working end-to-end dog product, not a mockup | Landing page, per-dog onboarding, photo check-in, voiced result, history query, passport mint and shelter tip | Non-Bruno flow implemented and browser tested on desktop, mobile and a public preview |
| Google AI | Distinguishable structured vision reads from dog photos | `api/analyze.js` sends a compressed image frame to Gemini with a strict JSON schema and a non-diagnostic system instruction | Live Preview call passed with a real dog photo: relaxed mood, 7/10 energy, visible-posture notes and 0.90 confidence |
| ElevenLabs | Browser audio after the Gemini read, under 15 seconds for the demo | `api/voice.js` converts the generated first-person line to MP3; the app plays it inline and falls back to browser speech | Live Preview call returned a valid 43,511-byte MP3 at 44.1 kHz and 128 kbps |
| Snowflake | Store check-ins and return a grounded trend answer from three or more rows | `api/dogs.js` stores profiles; `api/checkins.js` upserts dog-scoped rows; `api/query.js` queries only the requested random dog ID | Credentials reach Snowflake, but live writes are blocked because the account trial ended and every virtual warehouse is suspended; browser fallback remains usable |
| Solana | Phantom connect, devnet NFT mint, devnet shelter tip and explorer evidence | Metaplex Token Metadata mint uses the server vault; the tip endpoint creates a 0.01 SOL transaction for Phantom to sign; UI shows explorer links | Live Preview prepared a valid unsigned devnet tip transaction after pinning the server runtime dependency; mint/sign/broadcast were intentionally not triggered |

## Submission obligations from the supplied brief

- One DEV post using the official template
- Prize categories named explicitly: Google AI, ElevenLabs, Snowflake and Solana
- Demo video or embedded live link
- Public GitHub repository embedded in the post
- README note for any work outside the contest window
- New work created during the challenge window

## External checks still required

- Start the official Devpost workflow and confirm the live rules, dates, judging weights and submission form.
- Reactivate the Snowflake account or attach billing, resume a virtual warehouse, and then record three dog-scoped BarkPass rows plus a grounded history answer.
- Confirm the vault is funded on devnet, then explicitly authorize and record a successful mint and Phantom-signed tip with explorer links.
- Run the five-photo Gemini differentiation set and record latency for Gemini plus ElevenLabs.
