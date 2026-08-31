import { Skeleton } from "@/components/ui/skeleton"

export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-40" />

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="mt-3 h-9 w-full" />
        <Skeleton className="mt-2 h-9 w-2/3" />
        <Skeleton className="mt-4 h-5 w-full" />

        <Skeleton className="mt-8 aspect-[16/10] w-full rounded-lg" />

        <div className="mt-10 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}
