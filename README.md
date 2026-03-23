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
- **Production build:** `.env.production.local` — see `.env.production.example`.

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
