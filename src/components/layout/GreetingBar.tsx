export function GreetingBar() {
  return (
    <div className="mb-10 flex min-w-0 items-center gap-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-md">
        <img
          src="/IMG_6068.jpeg"
          alt=""
          className="h-full w-full scale-[1.35] object-cover object-center"
        />
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
          Hi, Toby!
        </p>
        <p className="text-sm text-neutral-500">Your research workspace</p>
      </div>
    </div>
  )
}
