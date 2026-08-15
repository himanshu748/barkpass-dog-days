# DEV Weekend challenge readiness

This review uses the BarkPass product brief and DEV Weekend Challenge template supplied with the project. This is a DEV Community challenge, not a Devpost submission.

## Working criteria

| Track | Brief acceptance criterion | BarkPass implementation | Verification state |
| --- | --- | --- | --- |
| Overall | A working end-to-end dog product, not a mockup | Landing page, per-dog onboarding, photo check-in, voiced result, history query, passport mint and shelter tip | Any-dog flow implemented; one-click seven-day judge demo added; first-run transition, desktop and 390 px layout browser tested |
| Google AI | Distinguishable structured vision reads from dog photos | `api/analyze.js` sends a compressed image frame to Gemini with a strict JSON schema and a non-diagnostic system instruction | Live Preview call passed with a real dog photo: relaxed mood, 7/10 energy, visible-posture notes and 0.90 confidence |
| ElevenLabs | Browser audio after the Gemini read, under 15 seconds for the demo | `api/voice.js` converts the generated first-person line to MP3; the app plays it inline and falls back to browser speech | Live Preview call returned a valid 43,511-byte MP3 at 44.1 kHz and 128 kbps |
| Snowflake | Store check-ins and return a grounded trend answer from three or more rows | `api/dogs.js` stores profiles; `api/checkins.js` upserts dog-scoped rows; `api/query.js` queries only the requested random dog ID | Live BarkPass Preview stored Luna and three check-ins through the least-privilege service user; grounded answer returned average 7.0 and range 6 to 8; direct worksheet aggregate matched |
| Solana | Phantom connect, devnet NFT mint, devnet shelter tip and explorer evidence | Metaplex Token Metadata mint uses the server vault; the tip endpoint creates a 0.01 SOL transaction for Phantom to sign; UI shows explorer links | Luna's NFT mint finalized successfully on devnet with supply one; public metadata and Explorer links verified. Phantom tip signature remains |

## Submission obligations from the supplied brief

- One DEV post using the official template
- Prize categories named explicitly: Google AI, ElevenLabs, Snowflake and Solana
- Demo video or embedded live link
- Public GitHub repository embedded in the post
- README note for any work outside the contest window
- New work created during the challenge window

## Submission status

- Sign and broadcast the prepared 0.01 SOL shelter tip from Phantom, then add its Explorer link.
- Published the completed DEV post before the deadline: https://dev.to/himanshu_748/barkpass-an-ai-wellness-passport-that-lets-dogs-speak-53d0
- The public live link satisfies the brief's demo-video-or-live-link requirement; no video is required.
