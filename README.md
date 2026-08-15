# BarkPass

BarkPass is a responsive AI wellness passport for any dog. The root route is an editorial product landing page featuring Bruno as the example dog; `/app` starts with personal dog onboarding and opens that dog’s working check-in dashboard.

Public BarkPass app: https://barkpass-dog-days.vercel.app/app

Published DEV Challenge submission: https://dev.to/himanshu_748/barkpass-an-ai-wellness-passport-that-lets-dogs-speak-53d0

Optional sample story: open https://barkpass-dog-days.vercel.app/app?sample=1 to load Bruno's seven-day history immediately. From there, a visitor can ask a grounded trend question, inspect the four-track status panel, connect the labeled demo wallet, and open verified Solana devnet proof. Creating a new BarkPass still starts with a clean dog-specific profile and history. The earlier `?demo=1` link remains compatible.

## Run locally

```bash
npm install
npm run dev
```

## Demo behavior

The app remains usable without credentials through local demo fallbacks. On Vercel, the same UI calls the real provider routes in `api/`:

- Gemini performs the structured visual mood and energy read.
- ElevenLabs returns an MP3 voice note that plays inline.
- Snowflake stores check-ins and grounds history answers in queried rows.
- Metaplex mints the passport on Solana devnet, while Phantom signs the shelter tip.

The three photographs of Bruno were created with Higgsfield and optimized for the web at `public/bruno-higgsfield.jpg`, `public/bruno-passport-higgsfield.jpg` and `public/bruno-walk-higgsfield.jpg`. Data graphics and interface controls remain code-native SVG and CSS.

Production builds call the same-origin Vercel Functions automatically. During local Vite development, set `VITE_API_BASE_URL` to a running functions host if you want the live provider path. Otherwise the demo fallbacks remain active.

Protected Vercel deployments keep sponsor credentials server-side. Their sensitive values remain unreadable and are never stored in this repository. BarkPass connects to Snowflake with a dedicated least-privilege service user and `SNOWFLAKE_PRIVATE_KEY_BASE64`/`SNOWFLAKE_JWT`; password authentication remains only as a local compatibility fallback. See `.env.example` for the complete contract. Do not place secret values in source control.

Live Preview verification on August 15, 2026 confirmed Gemini structured image analysis, an ElevenLabs MP3 response, unsigned Solana devnet tip preparation, and a real Snowflake write/query path. All four sponsor integrations now live on the protected `barkpass-dog-days` Preview; the obsolete Ember project was removed after migration. A Luna profile and three dog-scoped check-ins were persisted in `BARKPASS.PUBLIC`; the returned answer reported an average energy of 7.0 and a range of 6 to 8. The browser still keeps profiles and history usable through the explicitly labeled local fallback when a sponsor service is unavailable.

The public deployment intentionally contains no sponsor credentials. It exercises the complete interface through labeled fallbacks without exposing billable provider routes. `BARKPASS_PUBLIC_ORIGIN` lets a protected live-provider deployment mint metadata that remains readable through the public project.

The app exposes these endpoints:

- `POST /api/dogs`
- `POST /api/analyze`
- `POST /api/checkins`
- `POST /api/query`
- `POST /api/voice`
- `POST /api/solana/mint`
- `POST /api/solana/tip`

Run `npm test` for API contract checks and `npm run build` for the production client build. The `rpc-websockets` override is intentionally pinned at 9.3.8 so Vercel's CommonJS function bundle receives a compatible `uuid` release. See `CHALLENGE_READINESS.md` for the brief-to-implementation matrix and verification record.

Dog IDs are random per browser and are carried through profile storage, check-ins, Snowflake history queries and Solana passport metadata so one dog never inherits Bruno’s demo history. Profile photos remain local to the browser; prepared check-in frames are sent to Gemini only after the owner chooses a file.

The UI labels demo-only chain explorer results honestly. BarkPass is a wellness companion, not veterinary advice.

## Challenge timing

The implementation and verification documented here were completed on August 14 and 15, 2026, inside the supplied challenge window. No post-deadline work is included. If a later maintenance change is made after August 17, 2026 at 6:59 AM UTC, it will be documented in this section and visible in commit history.
