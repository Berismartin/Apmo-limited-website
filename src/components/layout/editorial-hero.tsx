import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EditorialHeroProps {
  eyebrow: string
  title: string
  copy: string
  image: string
  imageAlt: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export function EditorialHero({
  eyebrow,
  title,
  copy,
  image,
  imageAlt,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: EditorialHeroProps) {
  return (
    <section className="relative isolate min-h-[28rem] overflow-hidden lg:min-h-[36rem]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#351426]/80 via-[#351426]/45 to-[#351426]/20" />
      <div className="relative mx-auto flex min-h-[28rem] max-w-[1440px] flex-col justify-end px-4 py-16 sm:px-6 lg:min-h-[36rem] lg:px-8 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-100">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl italic leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{copy}</p>
        {(primaryHref || secondaryHref) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {primaryHref && primaryLabel ? (
              <Button asChild size="lg" className="rounded-full bg-white px-7 text-[#351426] hover:bg-rose-50">
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 px-7 text-white hover:bg-white/20"
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
