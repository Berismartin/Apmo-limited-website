import { TestimonialForm } from "@/components/admin/testimonial-form"
import { PageHeader } from "@/components/ui/page-header"
import {
  createTestimonialAction,
  getAdminTestimonialsState,
} from "@/lib/admin/testimonial-admin"

export default async function NewAdminTestimonialPage() {
  const { demoMode } = await getAdminTestimonialsState()

  return (
    <div>
      <PageHeader
        title="New testimonial"
        description="Add a customer quote for the homepage and testimonials page."
      />
      {demoMode ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase testimonials table is not available yet. Apply the migration before creating
          quotes.
        </p>
      ) : (
        <div className="mt-8">
          <TestimonialForm action={createTestimonialAction} submitLabel="Create testimonial" />
        </div>
      )}
    </div>
  )
}
