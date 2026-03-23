/** Shown when Vite build has no Firebase web config (e.g. Vercel env not set for Production). */
export function FirebaseConfigMissing({ missing }: { missing: string[] }) {
  return (
    <div className="min-h-dvh bg-neutral-50 px-4 py-10 text-neutral-900">
      <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Firebase configuration missing</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The app needs your Firebase web app keys at <strong>build time</strong>. These
          variables were not set when the site was built:
        </p>
        <ul className="mt-3 list-inside list-disc text-sm font-mono text-neutral-800">
          {missing.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
        <h2 className="mt-6 text-sm font-semibold text-neutral-900">Vercel</h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-neutral-600">
          <li>
            Project → <strong>Settings</strong> → <strong>Environment Variables</strong>.
          </li>
          <li>
            Add each key above (values from Firebase Console → Project settings → Your
            apps).
          </li>
          <li>
            Enable them for <strong>Production</strong> (and Preview if you use preview
            deploys).
          </li>
          <li>
            <strong>Redeploy</strong> — env is baked in at build time, not runtime.
          </li>
        </ol>
        <h2 className="mt-6 text-sm font-semibold text-neutral-900">Local</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Copy <code className="rounded bg-neutral-100 px-1">.env.example</code> to{' '}
          <code className="rounded bg-neutral-100 px-1">.env.local</code> and fill in
          values.
        </p>
      </div>
    </div>
  )
}
