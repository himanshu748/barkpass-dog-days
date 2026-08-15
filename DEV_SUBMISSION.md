---
title: "BarkPass: One photo becomes your dog's AI wellness story"
published: true
tags: devchallenge, weekendchallenge, ai, webdev
---

*This is a submission for [Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13).*

Most dog owners already take a photo every day. What they do not have is a simple way to turn those moments into a useful pattern.

**BarkPass turns one dog photo into a structured wellness check-in, a voice update, a grounded history and a portable pet passport.** It stays focused on visible signals and never pretends to diagnose a condition or replace a veterinarian.

## What I Built

BarkPass is a daily wellness companion for **any dog**:

1. Create a dog-specific profile.
2. Add a photo or short video from today.
3. Receive a structured read of visible mood, energy, posture and flags.
4. Hear the result as a short first-person voice note.
5. Save the check-in and ask plain-language questions about change over time.
6. Create a portable pet passport anchored on Solana devnet.

Bruno is the editorial example on the landing page, not a hardcoded user. Every visitor receives a separate random dog ID that scopes the profile, check-ins, history queries and passport metadata.

![BarkPass landing page](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/01-landing-page.png)

## Try BarkPass

**One-click judge demo:** https://barkpass-dog-days.vercel.app/app?demo=1

**Clean onboarding for your dog:** https://barkpass-dog-days.vercel.app/app

**Source:** https://github.com/himanshu748/barkpass-dog-days

![BarkPass personalized dashboard](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/02-personalized-dashboard.png)

The judge demo opens with seven realistic check-ins and a ready-to-run history question. It shows the complete experience immediately, while `/app` starts with an empty profile so a judge can confirm BarkPass is not only about Bruno.

The unrestricted public deployment is deliberately secret-free. It demonstrates the full interface through clearly labelled local fallbacks, while real sponsor calls were verified on a protected Vercel Preview and documented below. No billable credential is exposed to the browser.

## Why these four technologies belong together

- **Gemini** turns an everyday image into a consistent, structured observation.
- **ElevenLabs** makes the check-in memorable by giving the dog a short voice update.
- **Snowflake** turns isolated observations into a dog-specific history that can answer questions without inventing data.
- **Solana** makes the pet passport portable and independently verifiable on devnet.

The result is one coherent daily ritual, not four disconnected API demos.

## How I Built It

### Google AI: structured signals, not vague vibes

The browser downsizes a selected image or extracts one frame from a short video before calling `/api/analyze`. Gemini receives a non-diagnostic behavior-observer instruction plus a strict JSON schema for mood, energy from 1 to 10, posture notes, visible flags and confidence. The server normalizes the response before the interface renders it.

I ran five licensed dog photographs through the live provider path. Gemini produced four distinct moods—playful, anxious, relaxed and alert—with energy values from 4 to 9. Average response time was 6.94 seconds; the slowest was 10.53 seconds.

### ElevenLabs: a result owners will remember

BarkPass converts the structured observation into one short first-person line and sends it to ElevenLabs. The endpoint returns an MP3 that plays inline without a page refresh. Browser speech is available as an explicitly labelled fallback.

The measured live call returned an 84,889-byte MP3 in 1.55 seconds. Combined with the slowest image analysis, the measured provider path was 12.08 seconds—inside the challenge's 15-second demo target.

### Snowflake: answers grounded in the rows that exist

Profiles are merged into `BARKPASS_DOGS`; check-ins are merged into `BARKPASS_CHECKINS` using both check-in ID and dog ID. History questions query only the current dog's rows. The answer is calculated from returned energy values and mood counts, so it cannot invent a trend that is absent from the data.

BarkPass uses an X-Small auto-suspending warehouse and a dedicated service identity with key-pair authentication and a least-privilege role. In live verification, BarkPass stored Luna plus three check-ins with energies 6, 8 and 7. The grounded response reported an average of 7.0, a range of 6 to 8 and a higher final value. A direct worksheet aggregate independently returned the same row count, average, minimum and maximum.

![Snowflake aggregate proof](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/04-snowflake-proof.png)

### Solana: a passport judges can verify themselves

The passport endpoint creates dog-specific Metaplex metadata containing breed, age, microchip ID and vaccination date. Minting uses a server-side devnet authority. Shelter tips are prepared server-side and require explicit approval in the owner's Phantom wallet before broadcast.

Luna's BarkPass was minted successfully on devnet as [`AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3`](https://explorer.solana.com/address/AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3?cluster=devnet). The [mint transaction](https://explorer.solana.com/tx/3Y7VExjN5i9nU6ZPmjWW8nVW53ZWF7vJUX48EEQYtgWnmh9kmNiKTjknNNfxKatwUWs8RP2P4SnZ6vpbKzCdTi4m?cluster=devnet) finalized without error, and RPC verification shows an initialized NFT mint with supply one.

## Reliability, privacy and proof

- Profile photos remain in the owner's browser. Only a prepared check-in frame is sent after the owner selects it.
- Local profiles and history remain usable when a sponsor service is unavailable.
- Provider fallbacks are labelled; demo data is never presented as a live response.
- BarkPass is a wellness companion, not veterinary advice.
- Nine API contract tests cover Gemini normalization, playable ElevenLabs audio, dog validation, Snowflake key-pair auth and dog scoping, dynamic passport metadata and pre-mint validation.
- The production build and all nine tests pass.

## Prize Categories

- Best Use of Google AI
- Best Use of ElevenLabs
- Best Use of Snowflake
- Best Use of Solana

## What comes next

The weekend build proves the daily loop. The next version would add authenticated multi-device profiles, owner-controlled sharing with carers or veterinarians, push reminders and stronger public request controls for the live provider path.

BarkPass starts with something dog owners already do—take a photo—and turns it into a story they can hear, question and carry with their dog.
