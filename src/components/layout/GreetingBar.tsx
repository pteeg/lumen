export function GreetingBar() {
  return (
    <div className="flex min-w-0 items-center gap-4 md:gap-5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full shadow-md md:h-[4.5rem] md:w-[4.5rem]">
        <img
          src="/IMG_6068.jpeg"
          alt=""
          className="h-full w-full scale-[1.35] object-cover object-center"
        />
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl md:leading-tight lg:text-[2.75rem] lg:leading-[1.15]">
          Hi, Toby!
        </p>
        <p className="mt-1 text-base text-neutral-500 md:mt-1.5 md:text-lg">
          Ad veritatem et lucem ✨
        </p>
      </div>
    </div>
  )
}
