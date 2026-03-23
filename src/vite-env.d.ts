/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  /** Firestore document ID under `interviewGuides/{id}` (default: `main`) */
  readonly VITE_FIRESTORE_INTERVIEW_GUIDE_DOC_ID?: string
  /** Set to `true` to use local-only state (no Firestore read/write) */
  readonly VITE_DISABLE_INTERVIEW_GUIDE_FIRESTORE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
