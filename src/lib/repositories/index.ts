import { isSupabaseConfigured } from "@/lib/supabase/server"
import { jsonProductRepository } from "./json-product-repository"
import { jsonCategoryRepository } from "./json-category-repository"
import { jsonBrandRepository } from "./json-brand-repository"
import { supabaseProductRepository } from "./supabase-product-repository"
import { supabaseCategoryRepository } from "./supabase-category-repository"
import { supabaseBrandRepository } from "./supabase-brand-repository"

const useSupabase = isSupabaseConfigured()

export const productRepository = useSupabase
  ? supabaseProductRepository
  : jsonProductRepository

export const categoryRepository = useSupabase
  ? supabaseCategoryRepository
  : jsonCategoryRepository

export const brandRepository = useSupabase
  ? supabaseBrandRepository
  : jsonBrandRepository

export { jsonPageRepository as pageRepository } from "./json-page-repository"
export { jsonBlogRepository as blogRepository } from "./json-blog-repository"
