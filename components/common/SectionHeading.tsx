type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div
      className={`max-w-3xl space-y-4 ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-700">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-tight text-earth-950 md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="text-base leading-8 text-earth-600 md:text-lg">{description}</p>
      )}
    </div>
  )
}
