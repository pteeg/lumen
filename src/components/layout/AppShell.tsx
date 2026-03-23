import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(253, 230, 138, 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(252, 231, 243, 0.2), transparent)',
        }}
        aria-hidden
      />
      <div className="relative">
        <AppHeader />
        <main className="mx-auto max-w-6xl px-5 pb-16 pt-6 md:px-8 md:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
