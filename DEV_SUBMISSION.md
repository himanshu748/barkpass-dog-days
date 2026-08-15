---
title: "Your dog's camera roll is a wellness history. BarkPass makes it speak."
published: true
tags: devchallenge, weekendchallenge, ai, webdev
---

*This is a submission for [Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13).*

Dog owners take hundreds of photos and then rely on memory for the question that matters: **has anything changed?** Yesterday's posture, last week's energy, that unusually restless look—each clue is visible for a moment and then buried between screenshots and receipts.

**BarkPass makes the camera roll queryable.**

One daily photo becomes a structured visual observation, a voice update spoken as the dog, a grounded history you can question and a portable pet passport. BarkPass notices what is visible; it never pretends to diagnose a condition or replace a veterinarian.

## What I Built

The product loop is **notice → hear → remember → carry**.

1. Create a profile for your dog.
2. Add today's photo or a short video.
3. Gemini returns a structured read of visible mood, energy, posture and flags.
4. ElevenLabs turns the result into a short first-person voice note.
5. Snowflake stores the check-in and grounds plain-language trend answers in the rows that actually exist.
6. Solana turns the dog's identity details into a portable, independently verifiable devnet passport.

Bruno is the editorial example on the landing page, not a hardcoded user. Every visitor receives a separate random dog ID that scopes the profile, check-ins, Snowflake history and passport metadata. Start from `/app` and BarkPass is about your dog, not mine.

![BarkPass landing page](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/3638aef5ed9c4a1fdb0c75e94a7498018c6f6b6e/submission-assets/01-landing-page.png)

## Demo

🔗 **One-click judge demo:** https://barkpass-dog-days.vercel.app/app?demo=1

🔗 **Create a BarkPass for your dog:** https://barkpass-dog-days.vercel.app/app

🔗 **Source:** https://github.com/himanshu748/barkpass-dog-days

The judge link opens with Bruno's seven-day story and a ready-to-run history question. A judge can understand the full loop in under a minute: inspect the saved values, ask how energy changed, play the daily voice update and open the verified Solana mint. The clean `/app` route starts with empty onboarding to prove the system works for any dog.

![BarkPass personalized dashboard](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/02-personalized-dashboard.png)

The unrestricted public deployment is deliberately secret-free. It demonstrates the complete interface through clearly labelled local fallbacks, while the real sponsor calls were verified on a protected Vercel Preview and are documented below. No billable provider credential is exposed to the browser.

## The architecture

The loop is one pipeline, not four sponsor logos attached to a landing page:

```text
photo or video frame
        ↓
Gemini structured observation
        ↓
ElevenLabs first-person voice update
        ↓
Snowflake dog-scoped memory and grounded answer
        ↓
Solana portable pet passport
```

The React client handles profiles, media preparation, playback and local resilience. Vercel Functions own provider calls and keep credentials server-side. The same random dog ID travels through browser storage, Snowflake rows, history queries and Solana metadata, so one dog's story never leaks into another's.

## How I Built It

### Google AI: the observer

Gemini does not receive a vague "how is this dog feeling?" prompt. The browser first downsizes an image or extracts one frame from a short video. `/api/analyze` then sends that frame with a non-diagnostic behavior-observer instruction and a strict JSON schema:

- mood label
- energy from 1 to 10
- posture notes
- visible flags only
- confidence

The server normalizes the structured response before the UI renders it. That keeps the check-ins comparable from day to day and prevents prose from quietly changing the data shape.

I ran five licensed dog photographs through the live provider path. Gemini produced four distinct moods—playful, anxious, relaxed and alert—with energy values from 4 to 9. Average response time was 6.94 seconds; the slowest was 10.53 seconds.

The design rule is simple: **describe the frame, do not invent the dog.**

### ElevenLabs: the voice

A score is useful. A sentence is memorable.

BarkPass converts the structured observation into one short first-person line, then sends it to ElevenLabs. The endpoint returns an MP3 that plays inline without a refresh. If the provider is unavailable, browser speech remains available and is explicitly labelled as a fallback.

The measured live call returned an 84,889-byte MP3 in 1.55 seconds. Even when combined with the slowest image analysis, the measured provider path was 12.08 seconds—inside the challenge's 15-second demo target.

That voice is not there to pretend BarkPass can translate dogs. It is there to make a daily observation easier for an owner to remember: *"I am feeling easy today, with plenty left in the tank for our evening walk."*

### Snowflake: the memory

One observation is a moment. Several observations become a pattern.

Profiles are merged into `BARKPASS_DOGS`; check-ins are merged into `BARKPASS_CHECKINS` using both check-in ID and dog ID. History questions query only the requested dog's rows. The answer is calculated from the returned energy values and mood counts, so it cannot invent a trend that is absent from the data.

BarkPass uses an X-Small auto-suspending warehouse and a dedicated service identity with key-pair authentication and a least-privilege role. In live verification, BarkPass stored Luna plus three check-ins with energies 6, 8 and 7. The grounded response reported an average of 7.0, a range of 6 to 8 and a higher final value. A direct worksheet aggregate independently returned the same row count, average, minimum and maximum.

![Snowflake aggregate proof](https://raw.githubusercontent.com/himanshu748/barkpass-dog-days/main/submission-assets/04-snowflake-proof.png)

Snowflake is not an analytics screenshot added after the product. It is the reason BarkPass can answer **"Has her energy changed?"** with the numbers beside the sentence.

### Solana: the passport

A pet passport is more useful when it is not trapped inside one application's database.

The passport endpoint creates dog-specific Metaplex metadata containing breed, age, microchip ID and vaccination date. Minting uses a server-side devnet authority. Shelter tips are prepared server-side and require explicit approval in the owner's Phantom wallet before broadcast.

Luna's BarkPass was minted successfully on devnet as [`AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3`](https://explorer.solana.com/address/AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3?cluster=devnet). The [mint transaction](https://explorer.solana.com/tx/3Y7VExjN5i9nU6ZPmjWW8nVW53ZWF7vJUX48EEQYtgWnmh9kmNiKTjknNNfxKatwUWs8RP2P4SnZ6vpbKzCdTi4m?cluster=devnet) finalized without error. RPC verification shows an initialized NFT mint with supply one.

Devnet SOL has no monetary value. The point here is the verifiable lifecycle: generate dog-specific metadata, mint once, return Explorer proof and require the owner's wallet approval for any tip transaction.

## Reliability and privacy

- Profile photos stay in the owner's browser. Only a prepared check-in frame is sent after the owner selects it.
- Local profiles and history keep working when a sponsor service is unavailable.
- Provider fallbacks are labelled; demo data is never presented as a live response.
- BarkPass is a wellness companion, not veterinary advice.
- Keyboard focus, reduced-motion support, loading states, responsive layouts and clear errors are built in.
- Nine API contract tests cover Gemini normalization, playable ElevenLabs audio, dog validation, Snowflake key-pair auth and dog scoping, dynamic passport metadata and pre-mint validation.
- All nine tests and the production build pass.

## Prize Categories

**Best Use of Google AI, Best Use of ElevenLabs, Best Use of Snowflake and Best Use of Solana.**

The four technologies are load-bearing stages of one product loop: Gemini notices, ElevenLabs gives the moment a voice, Snowflake remembers and Solana lets the passport travel.

## What comes next

The weekend build proves the daily ritual. The next version would add authenticated multi-device profiles, owner-controlled sharing with carers or veterinarians, push reminders and stronger public request controls for the live provider path.

Most pet apps begin by asking owners to become better record keepers. BarkPass begins with something they already do—take a photo—and turns that tiny habit into a story they can hear, question and carry with their dog.
