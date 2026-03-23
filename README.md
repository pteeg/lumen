# Lumen

React + TypeScript + Vite app for interview guide workflows, with Firebase (Firestore + Hosting).

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Firebase web config from Firebase Console → Project settings.
npm run dev
```

## Environment

- **Development:** `.env.local` (gitignored) — use your dev Firebase project.
- **Production build (local):** `.env.production.local` — see `.env.production.example`.

### Vercel (or any remote host)

Vite only injects env vars that exist **at build time**. Your production Firebase values must be set in the host’s UI, not only on your laptop.

1. Open the project on [Vercel](https://vercel.com/) → **Settings** → **Environment Variables**.
2. Add the same names as in `.env.production.example`, using your **production** Firebase project (from Firebase Console → Project settings → Your apps).
3. Apply them to **Production** (and **Preview** if you want preview deploys to work).
4. **Redeploy** (Deployments → … → Redeploy) so the next build picks them up.

Required for a successful client build:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Optional:

- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIRESTORE_INTERVIEW_GUIDE_DOC_ID` (default `main` if omitted)

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run deploy:hosting` | Build + deploy to Firebase Hosting (`prod` alias) |
| `npm run deploy:firestore-rules` | Deploy Firestore rules (default project) |
| `npm run deploy:firestore-rules:prod` | Deploy rules to production project |

## Firebase

- Firestore rules live in `firestore.rules`; enable **Anonymous** sign-in for the interview guide sync.
- Hosting config is in `firebase.json` (SPA rewrites for client-side routing).
