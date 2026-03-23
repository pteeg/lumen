/** Env keys the Firebase client needs at build time (Vite `VITE_*`). */
export const REQUIRED_FIREBASE_ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

export function missingFirebaseEnvKeys(): string[] {
  return REQUIRED_FIREBASE_ENV_KEYS.filter((k) => {
    const v = import.meta.env[k as keyof ImportMetaEnv]
    return v === undefined || v === ''
  })
}
