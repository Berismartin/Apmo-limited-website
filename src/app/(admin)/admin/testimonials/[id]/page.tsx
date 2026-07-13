import { notFound } from "next/navigation"
import { TestimonialForm } from "@/components/admin/testimonial-form"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteTestimonialAction,
  getAdminTestimonial,
  getAdminTestimonialsState,
  updateTestimonialAction,
} from "@/lib/admin/testimonial-admin"
import { DeleteTestimonialDialog } from "@/components/admin/delete-testimonial-dialog"

interface EditAdminTestimonialPageProps {
  params: Promise<{ id: string }>
}

export default async function EditAdminTestimonialPage({
  params,
}: EditAdminTestimonialPageProps) {
  const { id } = await params
  const [{ demoMode }, testimonial] = await Promise.all([
    getAdminTestimonialsState(),
    getAdminTestimonial(id),
  ])

  if (!testimonial) notFound()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Edit ${testimonial.name}`}
          description="Update quote, rating, featured status, and visibility."
        />
        {!demoMode ? (
          <DeleteTestimonialDialog
            testimonialId={testimonial.id}
            testimonialName={testimonial.name}
            deleteAction={deleteTestimonialAction}
          />
        ) : null}
      </div>

      {demoMode ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Showing local starter content. Apply the testimonials migration to edit live quotes.
        </p>
      ) : (
        <div className="mt-8">
          <TestimonialForm
            action={updateTestimonialAction}
            testimonial={testimonial}
            submitLabel="Save changes"
          />
        </div>
      )}
    </div>
  )
}
