import { AppImage } from "@/components/ui/app-image"
import Link from "next/link"
import { FilePlus, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { formatDate } from "@/lib/utils"
import { getAdminBlogState, deleteBlogPostAction } from "@/lib/admin/blog-admin"
import { DeleteBlogDialog } from "@/components/admin/delete-blog-dialog"

export default async function AdminBlogPage() {
  const { posts, demoMode } = await getAdminBlogState()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Blog"
          description="Create and publish posts that appear on the public /blog pages."
        />
        <Button asChild>
          <Link href="/admin/blog/new">
            <FilePlus className="mr-2 h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      {demoMode ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Showing local starter posts. Run the blog migration on Supabase, then create or
          edit posts here to sync with the live storefront.
        </p>
      ) : null}

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Post</th>
                  <th className="px-4 py-3 font-medium">Author</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-rose-100 bg-rose-50">
                          {post.coverImage ? (
                            <AppImage
                              src={post.coverImage.url}
                              alt={post.coverImage.alt}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-rose-200" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-xs text-muted-foreground">/{post.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{post.author}</td>
                    <td className="px-4 py-3">{formatDate(post.publishedAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.tags.length ? post.tags.join(", ") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/blog/${post.id}`}>Edit</Link>
                        </Button>
                        {!demoMode ? (
                          <DeleteBlogDialog
                            postId={post.id}
                            postTitle={post.title}
                            deleteAction={deleteBlogPostAction}
                            triggerNode={<Button size="sm" variant="destructive" />}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      No blog posts yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
