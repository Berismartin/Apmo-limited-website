import { isSupabaseConfigured } from "@/lib/supabase/server"
import { jsonProductRepository } from "./json-product-repository"
import { jsonCategoryRepository } from "./json-category-repository"
import { jsonBrandRepository } from "./json-brand-repository"
import { jsonBlogRepository } from "./json-blog-repository"
import { jsonTestimonialRepository } from "./json-testimonial-repository"
import { supabaseProductRepository } from "./supabase-product-repository"
import { supabaseCategoryRepository } from "./supabase-category-repository"
import { supabaseBrandRepository } from "./supabase-brand-repository"
import { supabaseBlogRepository } from "./supabase-blog-repository"
import { supabaseTestimonialRepository } from "./supabase-testimonial-repository"

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

export const blogRepository = useSupabase
  ? supabaseBlogRepository
  : jsonBlogRepository

export const testimonialRepository = useSupabase
  ? supabaseTestimonialRepository
  : jsonTestimonialRepository

export { jsonPageRepository as pageRepository } from "./json-page-repository"
