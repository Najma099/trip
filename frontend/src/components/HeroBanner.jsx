const GRADIENT =
  'linear-gradient(105deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 58, 138, 0.75) 45%, rgba(30, 58, 138, 0.35) 75%, rgba(14, 165, 233, 0.15) 100%)'

export default function HeroBanner({
  testId,
  imageSrc,
  imageAlt = '',
  heightClass = 'h-[280px] sm:h-[340px] lg:h-[380px]',
  eyebrow,
  title,
  subtitle,
  rightSlot,
}) {
  return (
    <section
      data-testid={testId}
      className={`relative w-full overflow-hidden rounded-2xl border border-[color:var(--sp-border)] shadow-sm ${heightClass}`}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="sp-ken-burns absolute inset-0 z-0 h-full w-full object-cover"
        loading="eager"
        aria-hidden={!imageAlt}
      />
      <div className="absolute inset-0 z-10" style={{ background: GRADIENT }} />
      <div className="relative z-20 flex h-full items-center">
        <div className="flex w-full flex-col justify-center gap-3 px-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-10 sm:pb-8 sm:pt-6 lg:px-14">
          <div className="max-w-2xl sp-fade-up">
            {eyebrow && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
                {eyebrow}
              </div>
            )}
            <h1 className="font-sora text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">{subtitle}</p>
            )}
          </div>
          {rightSlot && <div className="flex-shrink-0 sp-fade-up">{rightSlot}</div>}
        </div>
      </div>
    </section>
  )
}
