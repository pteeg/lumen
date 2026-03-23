import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

function env(name: keyof ImportMetaEnv): string {
  const v = import.meta.env[name]
  if (v === undefined || v === '') {
    throw new Error(
      `Missing ${String(name)}. Copy .env.example to .env.local and add your Firebase web config.`,
    )
  }
  return v
}

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
}

/** Single Firebase app instance for the client */
export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)

/** Auth — anonymous sign-in is used so Firestore rules can require `request.auth != null` */
export const auth = getAuth(firebaseApp)

/** Firestore — interview guide and other collections */
export const db = getFirestore(firebaseApp)

/**
 * Optional Analytics — call after app mount if you use GA4.
 * Dynamic import keeps the main bundle smaller when analytics is unused.
 */
export async function getFirebaseAnalytics() {
  const { getAnalytics, isSupported } = await import('firebase/analytics')
  if (!(await isSupported())) return null
  if (!firebaseConfig.measurementId) return null
  return getAnalytics(firebaseApp)
}
