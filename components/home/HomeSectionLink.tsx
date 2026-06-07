import Link from 'next/link'

type HomeSectionLinkProps = {
  href: string
  label: string
}

export function HomeSectionLink({ href, label }: HomeSectionLinkProps) {
  return (
    <div className="mt-10 flex justify-center md:justify-end">
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full border border-earth-300 bg-white px-6 py-3 text-sm font-semibold text-earth-800 transition hover:border-rose-300 hover:text-rose-500"
      >
        {label}
        <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
