import { BlogForm } from "@/components/admin/blog-form"
import { PageHeader } from "@/components/ui/page-header"
import { createBlogPostAction, getAdminBlogState } from "@/lib/admin/blog-admin"

export default async function NewAdminBlogPostPage() {
  const { demoMode } = await getAdminBlogState()

  return (
    <div>
      <PageHeader title="New blog post" description="Publish a post to the public Apmo blog." />
      {demoMode ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase blog table is not available yet. Apply the blog migration before creating
          posts.
        </p>
      ) : (
        <div className="mt-8">
          <BlogForm action={createBlogPostAction} submitLabel="Create post" />
        </div>
      )}
    </div>
  )
}
