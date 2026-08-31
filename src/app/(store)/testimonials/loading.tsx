import { Skeleton } from "@/components/ui/skeleton"

export default function TestimonialsLoading() {
  return (
    <div className="bg-[#fff8f1]">
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
        <div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-4 h-16 w-full" />
          <Skeleton className="mt-2 h-16 w-2/3" />
          <Skeleton className="mt-6 h-5 w-full" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-11 w-40 rounded-full" />
            <Skeleton className="h-11 w-40 rounded-full" />
          </div>
        </div>
        <Skeleton className="min-h-[32rem] w-full rounded-[2rem]" />
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[1.5rem]" />
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  )
}
