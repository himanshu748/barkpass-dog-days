---
title: BarkPass: An AI wellness passport that lets dogs speak
published: true
tags: devchallenge, weekendchallenge, ai, webdev
---

*This is a submission for [Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13).*

**Published post:** https://dev.to/himanshu_748/barkpass-an-ai-wellness-passport-that-lets-dogs-speak-53d0

## What I Built

BarkPass is a daily wellness passport for any dog. An owner creates a profile, uploads a photo or short video, and receives a structured, non-diagnostic behavior read. The result becomes a short first-person voice note from the dog, a history entry for trend questions, and a pet passport that can be anchored on Solana devnet.

The idea came from a simple problem: dog owners notice small changes every day, but those observations are usually scattered across photos, notes, and memory. BarkPass turns the easiest habit, taking a photo, into a repeatable check-in that is useful without pretending to replace a veterinarian.

Bruno appears on the editorial landing page as an example. The actual app onboards each visitor's dog and creates an isolated random dog ID for its profile, check-ins, trend queries, and passport metadata.

![BarkPass landing page](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/01-landing-page.png)

### What works today

- Per-dog onboarding with a local profile photo and dog-scoped history
- Client-side photo resizing and video-frame extraction
- Gemini vision analysis with a strict JSON response schema
- ElevenLabs speech returned as an MP3 and played inline
- Snowflake profile, check-in, and grounded query routes
- A transparent local history fallback when the warehouse is unavailable
- Dynamic Solana passport metadata for the current dog
- Metaplex devnet NFT minting and a Phantom-signed 0.01 SOL shelter-tip flow
- Responsive layouts, keyboard focus, reduced-motion support, loading states, and clear errors

## Demo

**Public demo:** https://barkpass-dog-days.vercel.app/app

**One-click judge demo:** https://barkpass-dog-days.vercel.app/app?demo=1

![BarkPass personalized dashboard](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/02-personalized-dashboard.png)

The public deployment is intentionally secret-free and uses BarkPass's labeled local fallbacks. Live provider verification evidence is recorded separately so sponsor credentials are not exposed through an unrestricted demo endpoint.

The public live link fulfills the supplied brief's demo-video-or-embedded-live-link requirement.

Suggested flow for judges:

1. Open `/app?demo=1` to load Bruno's seven-day story immediately.
2. Ask the prefilled history question and inspect the seven underlying energy values.
3. Upload a fresh dog photo to exercise the Gemini read, then play the ElevenLabs voice note.
4. Open the passport section and view the verified Solana devnet mint.
5. Create a clean profile from `/app` to confirm that BarkPass works for any dog, not only Bruno.

## Code

**Repository:** https://github.com/himanshu748/barkpass-dog-days

The app is a Vite and React frontend with Vercel Functions for provider calls. API secrets remain server-side. Dog profile photos stay in the owner's browser, while only a prepared check-in image is sent to Gemini after the owner selects it.

Run it locally:

```bash
npm install
npm test
npm run dev
```

## How I Built It

### Google AI

The browser downsizes an image or extracts one frame from a short video before calling `/api/analyze`. Gemini receives a veterinary-behavior-observer instruction that forbids diagnosis and asks for only visible signals. The route uses a JSON schema for mood, energy from 1 to 10, posture notes, visible flags, and confidence. The result is normalized before it reaches the interface.

I tested five licensed real photographs against the live Preview. Gemini returned four distinct moods (playful, anxious, relaxed, and alert), energy values from 4 to 9, and an average response time of 6.94 seconds. The slowest image took 10.53 seconds.

### ElevenLabs

BarkPass turns the structured Gemini read into a short first-person line, then sends that text to ElevenLabs. The server returns an MP3, and the browser plays it without a refresh. Browser speech is an explicitly labeled fallback if the provider is unavailable.

The measured ElevenLabs call returned an 84,889-byte MP3 in 1.55 seconds. Even when combined with the slowest photo analysis, the measured provider path was 12.08 seconds, below the 15-second demo target.

### Snowflake

Profiles are merged into `BARKPASS_DOGS`, and check-ins are merged into `BARKPASS_CHECKINS` using both check-in ID and dog ID. History questions query only the current dog's recent rows. The answer is calculated from returned energy values and mood counts so it cannot invent a trend that is absent from the data.

The new 120-day Snowflake student trial is active. BarkPass uses an X-Small auto-suspending warehouse and a dedicated `BARKPASS_APP_USER` service identity with key-pair authentication and a least-privilege role. The live BarkPass Preview stored Luna plus three check-ins with energies 6, 8, and 7. Its grounded response was: “Across 3 Snowflake check-ins, Luna averaged 7.0 out of 10. Energy ranged from 6 to 8 and finished higher compared with the first saved day.” A direct worksheet query independently returned `dog_luna_123`, 3 rows, average 7.0, minimum 6, and maximum 8.

![Snowflake aggregate proof](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/04-snowflake-proof.png)

### Solana

The passport endpoint creates dog-specific Metaplex metadata containing breed, age, microchip ID, and vaccination date. Minting uses a server-side devnet authority, while shelter tips are prepared server-side and must be approved by the owner's Phantom wallet. Explorer links are returned for verifiable proof.

Luna's BarkPass was minted successfully on devnet as [`AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3`](https://explorer.solana.com/address/AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3?cluster=devnet). The [mint transaction](https://explorer.solana.com/tx/3Y7VExjN5i9nU6ZPmjWW8nVW53ZWF7vJUX48EEQYtgWnmh9kmNiKTjknNNfxKatwUWs8RP2P4SnZ6vpbKzCdTi4m?cluster=devnet) finalized without error, and RPC verification shows an initialized NFT mint with supply one. The Phantom-signed shelter-tip transaction remains to be added.

### Reliability and privacy

The interface preserves local profiles and check-ins when a sponsor service is unavailable. It never presents fallback data as live provider output. BarkPass is a wellness companion, not veterinary advice, and its prompts and copy avoid medical diagnoses.

The app includes nine API contract tests covering structured Gemini output, ElevenLabs audio, dog validation, Snowflake input validation, key-pair authentication and status, dog-scoped summaries, dynamic passport metadata, and pre-mint validation.

## Prize Categories

- Best Use of Google AI
- Best Use of ElevenLabs
- Best Use of Snowflake
- Best Use of Solana

## Known Limitations

- Visual observations are non-diagnostic and depend on the quality and framing of the uploaded image.
- Profile photos and fallback history are browser-local because accounts were intentionally out of scope for the weekend build.
- Solana actions use devnet and have no real monetary value.
- The public demo needs request controls before sponsor-backed endpoints are exposed without Vercel protection.
