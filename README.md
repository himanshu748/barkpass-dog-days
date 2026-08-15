# BarkPass

BarkPass is a responsive AI wellness passport for any dog. The root route is an editorial product landing page featuring Bruno as the example dog; `/app` starts with personal dog onboarding and opens that dog’s working check-in dashboard.

Public, secret-free judge demo: https://barkpass-dog-days.vercel.app/app

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

The `ember` Vercel project has 12 sensitive Gemini, ElevenLabs, Snowflake and Solana variables scoped to both Production and Preview. Their values remain unreadable and are never stored in this repository. See `.env.example` for the complete contract. Do not place secret values in source control.

Live Preview verification on August 15, 2026 confirmed Gemini structured image analysis, an ElevenLabs MP3 response and unsigned Solana devnet tip preparation. Snowflake reached the configured account, but the account rejected warehouse use because its free trial has ended and all virtual warehouses are suspended. The browser keeps profiles and history usable through the explicitly labeled local fallback until the Snowflake account is reactivated.

The public judge demo intentionally contains no sponsor credentials. It exercises the complete interface through labeled fallbacks without exposing billable provider routes. `BARKPASS_PUBLIC_ORIGIN` lets a protected live-provider deployment mint metadata that remains readable through the public project.

The app exposes these endpoints:

- `POST /api/dogs`
- `POST /api/analyze`
- `POST /api/checkins`
- `POST /api/query`
- `POST /api/voice`
- `POST /api/solana/mint`
- `POST /api/solana/tip`

Run `npm test` for API contract checks and `npm run build` for the production client build. The `rpc-websockets` override is intentionally pinned at 9.3.8 so Vercel's CommonJS function bundle receives a compatible `uuid` release. See `CHALLENGE_READINESS.md` for the brief-to-implementation matrix and remaining live verification steps.

Dog IDs are random per browser and are carried through profile storage, check-ins, Snowflake history queries and Solana passport metadata so one dog never inherits Bruno’s demo history. Profile photos remain local to the browser; prepared check-in frames are sent to Gemini only after the owner chooses a file.

The UI labels demo-only chain explorer results honestly. BarkPass is a wellness companion, not veterinary advice.
