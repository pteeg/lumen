import { NavLink } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/interviews', label: 'Interviews', end: false },
  { to: '/findings', label: 'Findings', end: false },
  { to: '/write-up', label: 'Write up', end: false },
]

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-3.5 md:px-6 md:pt-3.5">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[1.75rem] bg-white px-5 py-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] md:gap-4 md:px-7 md:py-3.5">
        <NavLink
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-400 md:gap-3.5"
        >
          <img
            src="/Lumen-just-logo.png"
            alt=""
            className="h-11 w-auto shrink-0 -translate-y-1.5 object-contain md:h-12"
          />
          <span className="truncate text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl">
            Lumen
          </span>
        </NavLink>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 md:flex md:items-center md:gap-8"
          aria-label="Main"
        >
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'font-semibold text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer keeps centred nav balanced with the logo on the left */}
        <div className="hidden shrink-0 md:block md:w-24" aria-hidden />
      </div>

      <nav
        className="mx-auto mt-2.5 flex max-w-6xl justify-center gap-4 md:hidden"
        aria-label="Main mobile"
      >
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? 'text-neutral-900' : 'text-neutral-500'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
