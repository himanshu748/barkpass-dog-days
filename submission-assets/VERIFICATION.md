# BarkPass submission verification

Verified against the Vercel Preview on August 15, 2026.

## Five-photo Gemini acceptance set

| Case | Gemini mood | Energy | Confidence | API latency |
| --- | --- | ---: | ---: | ---: |
| Real photo 1 | Playful | 6/10 | 0.80 | 10.53 s |
| Real photo 2 | Playful | 9/10 | 0.90 | 4.30 s |
| Real photo 3 | Anxious | 4/10 | 0.40 | 8.38 s |
| Real photo 4 | Relaxed | 7/10 | 0.90 | 6.81 s |
| Real photo 5 | Alert | 7/10 | 0.80 | 4.68 s |

The set produced four distinguishable moods and an energy range from 4 to 9. Average Gemini latency was 6.94 seconds.

## ElevenLabs latency

The live voice call returned an 84,889-byte MP3 in 1.55 seconds. Combined with the slowest Gemini request, the measured provider path was 12.08 seconds, below the 15-second acceptance target.

## Solana

The live server prepared an unsigned 0.01 SOL devnet shelter-tip transaction. No wallet signature or broadcast was performed during this verification. The live Ember Preview was also updated so NFT metadata resolves through the public BarkPass origin. A permanent devnet mint remains pending explicit approval of that on-chain side effect.

## Snowflake

The existing account rejected connections because its free trial ended and every virtual warehouse is suspended. A replacement account and three-row grounded-query proof are still required.

## Build checks

- API contract tests: 7/7 passed
- Vite production build: passed
- Public `/app` response: HTTP 200 at https://barkpass-dog-days.vercel.app/app
- Public dog-specific metadata endpoint: HTTP 200
- Preview provider configuration: Gemini, ElevenLabs, Snowflake and Solana present
- Staged-diff secret scan: 0 findings
