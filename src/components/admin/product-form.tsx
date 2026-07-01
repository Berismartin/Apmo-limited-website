import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Brand, Category, Product } from "@/types"

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>
  brands: Brand[]
  categories: Category[]
  product?: Product | null
  submitLabel: string
}

export function ProductForm({
  action,
  brands,
  categories,
  product,
  submitLabel,
}: ProductFormProps) {
  const variant = product?.variants[0]
  const image = product?.images[0]
  const selectedCategories = new Set(product?.categoryIds ?? [])

  return (
    <form action={action} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="auto-generated from name if empty"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_id">Brand</Label>
            <select
              id="brand_id"
              name="brand_id"
              defaultValue={product?.brandId ?? brands[0]?.id}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={product?.status ?? "draft"}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Short description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              rows={3}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="body">Product body HTML</Label>
            <Textarea
              id="body"
              name="body"
              defaultValue={product?.body}
              rows={7}
              placeholder="<h2>How it works</h2><p>...</p>"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={product?.tags.join(", ")}
              placeholder="detangler, curls, spray"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                defaultValue={product?.rating ?? 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review_count">Review count</Label>
              <Input
                id="review_count"
                name="review_count"
                type="number"
                min="0"
                defaultValue={product?.reviewCount ?? 0}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="h-4 w-4 rounded border-input"
            />
            Featured product
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="category_ids"
                value={category.id}
                defaultChecked={selectedCategories.has(category.id)}
                className="h-4 w-4 rounded border-input"
              />
              {category.name}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image and default variant</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              defaultValue={image?.url}
              placeholder="/images/site_images/IMG_1706.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_alt">Image alt text</Label>
            <Input id="image_alt" name="image_alt" defaultValue={image?.alt} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variant_name">Variant name</Label>
            <Input
              id="variant_name"
              name="variant_name"
              defaultValue={variant?.name ?? "Default"}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={variant?.sku} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={variant ? variant.price / 100 : 0}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compare_at_price">Compare at price</Label>
            <Input
              id="compare_at_price"
              name="compare_at_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={variant?.compareAtPrice ? variant.compareAtPrice / 100 : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" name="currency" defaultValue={variant?.currency ?? "USD"} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inventory_quantity">Inventory quantity</Label>
            <Input
              id="inventory_quantity"
              name="inventory_quantity"
              type="number"
              defaultValue={variant?.inventory.quantity ?? 0}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="variant_options">Variant options</Label>
            <Input
              id="variant_options"
              name="variant_options"
              defaultValue={variant?.options.map((option) => `${option.name}:${option.value}`).join(", ")}
              placeholder="Size:250ml, Scent:Original"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="track_inventory"
              defaultChecked={variant?.inventory.trackInventory ?? true}
              className="h-4 w-4 rounded border-input"
            />
            Track inventory
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="allow_backorder"
              defaultChecked={variant?.inventory.allowBackorder ?? false}
              className="h-4 w-4 rounded border-input"
            />
            Allow backorder
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/admin/products">Cancel</Link>
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}
