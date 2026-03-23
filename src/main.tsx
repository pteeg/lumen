import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { FirebaseConfigMissing } from './components/FirebaseConfigMissing'
import { missingFirebaseEnvKeys } from './lib/requiredFirebaseEnv'

const rootEl = document.getElementById('root')!
const missing = missingFirebaseEnvKeys()

if (missing.length > 0) {
  createRoot(rootEl).render(
    <StrictMode>
      <FirebaseConfigMissing missing={missing} />
    </StrictMode>,
  )
} else {
  void import('./lib/firebase').then(() => {
    void import('./App').then(({ default: App }) => {
      createRoot(rootEl).render(
        <StrictMode>
          <App />
        </StrictMode>,
      )
    })
  })
}
