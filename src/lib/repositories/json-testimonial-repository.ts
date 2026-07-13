import type { Testimonial } from "@/types"
import data from "@/data/testimonials.json"

const testimonials = data.testimonials as Testimonial[]

function sorted(items: Testimonial[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}

export const jsonTestimonialRepository = {
  async list(options?: { featuredOnly?: boolean; includeUnpublished?: boolean }) {
    let items = sorted(testimonials)
    if (!options?.includeUnpublished) {
      items = items.filter((item) => item.published)
    }
    if (options?.featuredOnly) {
      items = items.filter((item) => item.featured)
    }
    return items
  },

  async getById(id: string) {
    return testimonials.find((item) => item.id === id) ?? null
  },
}
