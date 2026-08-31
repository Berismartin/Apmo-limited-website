import { revalidatePath } from "next/cache"

/**
 * Product/category saves used to revalidate only `/` and `/shop`.
 * `revalidatePath("/")` does not touch `/(store)/[slug]`, so category
 * and product pages kept serving the HTML generated before images
 * were uploaded — admin looked fine, `/detergents` did not.
 *
 * Paths follow the route file tree (route groups included), not the
 * public URL, per Next.js `revalidatePath` docs.
 */
export function revalidateStorefront(extraPaths: string[] = []) {
  revalidatePath("/", "layout")
  revalidatePath("/(store)", "layout")
  revalidatePath("/(store)/[slug]", "page")
  revalidatePath("/shop")

  for (const path of extraPaths) {
    if (!path) continue
    revalidatePath(path.startsWith("/") ? path : `/${path}`)
  }
}
