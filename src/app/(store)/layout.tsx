import { StoreChrome } from "@/components/layout/store-chrome"
import { categoryRepository } from "@/lib/repositories"

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch category tree server-side so the Header doesn't depend on
  // a specific data source — the repository layer handles that.
  const categories = await categoryRepository.list()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <StoreChrome categories={categories}>
        {children}
      </StoreChrome>
    </>
  )
}
