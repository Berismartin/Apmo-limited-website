import Link from "next/link"
import { MessageSquarePlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import {
  deleteTestimonialAction,
  getAdminTestimonialsState,
} from "@/lib/admin/testimonial-admin"
import { DeleteTestimonialDialog } from "@/components/admin/delete-testimonial-dialog"

export default async function AdminTestimonialsPage() {
  const { testimonials, demoMode } = await getAdminTestimonialsState()

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Testimonials"
          description="Manage customer quotes shown on the homepage and /testimonials."
        />
        <Button asChild>
          <Link href="/admin/testimonials/new">
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New testimonial
          </Link>
        </Button>
      </div>

      {demoMode ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Showing local starter testimonials. Apply the testimonials migration to manage live
          quotes.
        </p>
      ) : null}

      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Quote</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.role}</div>
                    </td>
                    <td className="max-w-md px-4 py-3 text-muted-foreground">
                      <p className="line-clamp-2">{item.quote}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={item.published ? "default" : "secondary"}>
                          {item.published ? "Published" : "Hidden"}
                        </Badge>
                        {item.featured ? <Badge variant="outline">Featured</Badge> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/testimonials/${item.id}`}>Edit</Link>
                        </Button>
                        {!demoMode ? (
                          <DeleteTestimonialDialog
                            testimonialId={item.id}
                            testimonialName={item.name}
                            deleteAction={deleteTestimonialAction}
                            triggerNode={<Button size="sm" variant="destructive" />}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {testimonials.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      No testimonials yet.
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
