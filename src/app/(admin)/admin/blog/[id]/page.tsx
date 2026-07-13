import { notFound } from "next/navigation"
import { BlogForm } from "@/components/admin/blog-form"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteBlogPostAction,
  getAdminBlogPost,
  getAdminBlogState,
  updateBlogPostAction,
} from "@/lib/admin/blog-admin"
import { DeleteBlogDialog } from "@/components/admin/delete-blog-dialog"

interface EditAdminBlogPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAdminBlogPostPage({
  params,
}: EditAdminBlogPostPageProps) {
  const { id } = await params
  const [{ demoMode }, post] = await Promise.all([
    getAdminBlogState(),
    getAdminBlogPost(id),
  ])

  if (!post) notFound()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Edit ${post.title}`}
          description="Update content, cover image, tags, and publish date."
        />
        {!demoMode ? (
          <DeleteBlogDialog
            postId={post.id}
            postTitle={post.title}
            deleteAction={deleteBlogPostAction}
          />
        ) : null}
      </div>

      {demoMode ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Showing local starter content. Apply the blog migration to edit live posts.
        </p>
      ) : (
        <div className="mt-8">
          <BlogForm action={updateBlogPostAction} post={post} submitLabel="Save changes" />
        </div>
      )}
    </div>
  )
}
