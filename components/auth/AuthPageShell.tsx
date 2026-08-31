import Image from 'next/image'

type AuthPageShellProps = {
  serenityLabel: string
  children: React.ReactNode
}

export function AuthPageShell({ serenityLabel, children }: AuthPageShellProps) {
  return (
    <section className="px-6 py-12 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Image
            src="/logo-amara.png"
            alt="Amará"
            width={1536}
            height={1024}
            unoptimized
            className="h-24 w-auto object-contain sm:h-28"
            priority
          />
          <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.35em] text-earth-500">
            {serenityLabel}
          </p>
        </div>
        {children}
      </div>
    </section>
  )
}
