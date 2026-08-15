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

The live server prepared an unsigned 0.01 SOL devnet shelter-tip transaction. The approved Luna BarkPass mint was then broadcast and finalized successfully on Solana devnet.

- Mint: `AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3`
- [Mint on Solana Explorer](https://explorer.solana.com/address/AAutLzLLaXR74Dfr1jtJdftQunCtQu7P6QzrYNoPmeK3?cluster=devnet)
- [Finalized mint transaction](https://explorer.solana.com/tx/3Y7VExjN5i9nU6ZPmjWW8nVW53ZWF7vJUX48EEQYtgWnmh9kmNiKTjknNNfxKatwUWs8RP2P4SnZ6vpbKzCdTi4m?cluster=devnet)
- RPC verification: finalized with no error; mint initialized with supply `1` and `0` decimals
- Public metadata: verified from `https://barkpass-dog-days.vercel.app/api/passport-metadata`

The shelter tip is still unsigned because its final broadcast requires the owner's Phantom approval.

## Snowflake

The existing account rejected connections because its free trial ended and every virtual warehouse is suspended. A new 120-day student-trial signup was accepted on August 15, 2026 using Enterprise edition on AWS in Mumbai. Snowflake sent the activation email; inbox activation, credentials, and the three-row grounded-query proof are still required.

## Build checks

- API contract tests: 7/7 passed
- Vite production build: passed
- Public `/app` response: HTTP 200 at https://barkpass-dog-days.vercel.app/app
- Public dog-specific metadata endpoint: HTTP 200
- Preview provider configuration: Gemini, ElevenLabs, Snowflake and Solana present
- Staged-diff secret scan: 0 findings
