import type { Metadata } from "next"
import Link from "next/link"
import { Clock, User } from "lucide-react"
import { AppImage } from "@/components/ui/app-image"
import { PageHeader } from "@/components/ui/page-header"
import { Pagination } from "@/components/products/pagination"
import { blogRepository } from "@/lib/repositories"
import { formatDate } from "@/lib/utils"
import { blogTeaser } from "@/lib/blog-body"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { siteConfig } from "@/lib/config"

interface BlogIndexProps {
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({
  searchParams,
}: BlogIndexProps): Promise<Metadata> {
  const params = await searchParams
  const page = Number(params.page) || 1
  const canonical =
    page > 1 ? `${siteConfig.url}/blog?page=${page}` : `${siteConfig.url}/blog`
  return {
    title: "Blog",
    description:
      "Guides, stories, and notes from the team — sustainability, product care, and behind the scenes.",
    alternates: { canonical },
  }
}

export default async function BlogIndex({ searchParams }: BlogIndexProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const { items: posts, pagination } = await blogRepository.list({
    page,
    limit: 9,
  })

  // Repositories already return newest first: lead with the latest, list the rest beside it.
  const [featured, ...others] = posts

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Blog"
        description={`${pagination.total} ${pagination.total === 1 ? "post" : "posts"}`}
      />

      {featured ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <article>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" aria-hidden="true" />
              By {featured.author}
              <span aria-hidden="true">·</span>
              <time dateTime={featured.publishedAt}>
                {formatDate(featured.publishedAt)}
              </time>
            </p>
            <Link href={`/blog/${featured.slug}`} className="group">
              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#351426] group-hover:underline sm:text-4xl">
                {featured.title}
              </h2>
            </Link>
            <p className="mt-4 text-lg leading-8 text-[#351426]/85">
              {blogTeaser(featured.body)}{" "}
              <Link
                href={`/blog/${featured.slug}`}
                className="font-semibold text-rose-700 hover:underline"
              >
                Read more
              </Link>
            </p>
            <Link
              href={`/blog/${featured.slug}`}
              className="relative mt-6 block aspect-[16/10] overflow-hidden rounded-lg bg-neutral-100"
            >
              <AppImage
                src={featured.coverImage?.url ?? PLACEHOLDER_IMAGE}
                alt={featured.coverImage?.alt ?? featured.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </Link>
          </article>

          {others.length > 0 ? (
            <aside aria-label="More posts" className="lg:sticky lg:top-24 lg:self-start">
              <ul className="divide-y rounded-lg border bg-white px-5 shadow-sm">
                {others.map((post) => (
                  <li key={post.id}>
                    <Link href={`/blog/${post.slug}`} className="group flex gap-4 py-5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                        <AppImage
                          src={post.coverImage?.url ?? PLACEHOLDER_IMAGE}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0">
                        {post.tags[0] ? (
                          <p className="text-xs capitalize text-muted-foreground">
                            {post.tags[0].replace(/-/g, " ")}
                          </p>
                        ) : null}
                        <h3 className="mt-1 font-serif text-base leading-snug text-[#351426] group-hover:underline">
                          {post.title}
                        </h3>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <time dateTime={post.publishedAt}>
                            {formatDate(post.publishedAt)}
                          </time>
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      ) : null}

      <div className="mt-16">
        <Pagination pagination={pagination} basePath="/blog" />
      </div>
    </div>
  )
}
