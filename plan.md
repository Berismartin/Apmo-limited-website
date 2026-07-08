## Plan: Align Store, Admin, and Data Model

Create a consistency pass that keeps the current app structure intact while removing accidental duplication and wiring mismatches. The goal is to make the storefront, admin, and Supabase migrations reflect the same source of truth where the app already supports that pattern, and to avoid inventing new pages, features, or data models. UGX should be supported with no decimals in normal display, while still preserving any existing raw numeric storage if the code already assumes minor units.

**Steps**

1. Audit the current data flows for catalog, pages, blog, orders, auth, and media to confirm which surfaces are shared and which are intentionally separate. Focus on the shared repository layer in `src/lib/repositories`, the admin helpers in `src/lib/admin`, the storefront routes in `src/app/(store)`, and the Supabase migrations in `supabase/migrations`.
2. Align the catalog stack so storefront and admin read from the same product/category/brand definitions. Reuse the existing shared repository abstraction and keep the existing JSON fallback path only where Supabase support is already present. Do not add a second catalog source.
3. Reconcile page and blog content handling. Confirm that CMS-style pages and blog entries remain JSON-backed unless there is already a direct Supabase path in the codebase; avoid introducing a parallel admin editor or a second content model.
4. Review order handling and decide whether the current split is intentional. The storefront currently uses local Zustand order state, while the admin helper has separate demo order data. Keep the existing flow if it is deliberate, or consolidate only if an existing repository or migration already supports that model. Do not create a new order system.
5. Verify authentication wiring end-to-end. Keep the current demo-local auth behavior unless there is already a Supabase auth path in use. Check login/register flows, the admin guard, and any profile-dependent routes so they match the chosen auth source and do not conflict.
6. Resolve the product image storage mismatch. There is evidence of more than one bucket naming convention in the codebase and migrations; choose the bucket path that matches the current admin form and repository wiring, then make the migration set and code references agree on one storage target.
7. Check route duplication and slugs. Confirm that storefront routes are not duplicated between catch-all slug resolution and dedicated page routes, and that admin routes are only exposed once. Remove or retire only redundant wiring, not existing user-facing surfaces.
8. Add a currency gap review. Confirm that product, cart, checkout, order, and admin pricing all go through one shared formatter path, then update that path and any admin forms so UGX displays without decimals in normal UI while preserving any existing internal storage convention. Avoid adding per-page currency hacks.
9. Validate the resulting consistency with focused checks: repository resolution paths, auth guard behavior, admin product page wiring, currency formatting, and migration/schema alignment. Prefer narrow lint/type/test checks over broad refactors.

**Relevant files**

- `src/lib/repositories/index.ts` — shared source selection for catalog, pages, and blog repositories.
- `src/lib/repositories/json-product-repository.ts` — JSON fallback catalog source.
- `src/lib/repositories/json-category-repository.ts` — JSON category source.
- `src/lib/repositories/json-brand-repository.ts` — JSON brand source.
- `src/lib/repositories/json-page-repository.ts` — CMS page source.
- `src/lib/repositories/json-blog-repository.ts` — blog source.
- `src/lib/admin/product-admin.ts` — admin catalog helper reusing shared repositories.
- `src/lib/admin/order-admin.ts` — admin order data path.
- `src/lib/admin/product-image-storage.ts` — admin storage target for product images.
- `src/lib/supabase/server.ts` — Supabase configuration gating.
- `src/lib/env.ts` — env validation and required configuration.
- `src/lib/utils.ts` — shared price formatting helper.
- `src/lib/config.ts` — site currency and locale defaults.
- `src/store/auth.ts` — current auth state and demo users.
- `src/hooks/use-auth-guard.ts` — client-side admin gating.
- `src/app/(store)/auth/login/page.tsx` — login entry point.
- `src/app/(store)/auth/register/page.tsx` — registration entry point.
- `src/app/(store)/checkout/page.tsx` — storefront order creation path.
- `src/app/(store)/account/orders/page.tsx` — storefront order history.
- `src/app/(store)/[slug]/page.tsx` — catalog slug resolution.
- `src/app/(store)/pages/page.tsx` and `src/app/(store)/pages/[slug]/page.tsx` — CMS page surfaces.
- `src/app/(admin)/admin/layout.tsx` and `src/app/(admin)/admin/products/page.tsx` — admin access and catalog UI.
- `src/components/admin/product-form.tsx` and `src/components/admin/order-form.tsx` — admin currency inputs.
- `src/components/cart/cart-summary.tsx`, `src/components/products/product-card.tsx`, `src/components/search/search-modal.tsx`, `src/app/(store)/[slug]/product-detail-view.tsx`, `src/app/(store)/checkout/page.tsx`, `src/app/(store)/account/orders/page.tsx`, `src/app/(admin)/admin/orders/page.tsx`, and `src/app/(admin)/admin/products/page.tsx` — currency display touchpoints.
- `supabase/migrations/20260701172000_create_apmo_catalog.sql` — core catalog/auth schema.
- `supabase/migrations/20260701202500_create_admin_orders.sql` — admin order schema.
- `supabase/migrations/20260701211000_create_product_image_storage.sql` — older product image storage migration.
- `supabase/migrations/20260706190000_create_apmo_bucket_storage.sql` — newer storage migration.

**Verification**

1. Run a focused repository and route check after any changes to confirm storefront and admin still resolve through the same catalog helpers.
2. Run a focused auth/admin access check to confirm login, register, and admin guard behavior still matches the chosen auth source.
3. Run a migration/schema sanity pass to confirm the storage bucket, catalog tables, and admin expectations match one another.
4. Run a focused currency pass to verify UGX formats without decimals in the normal UI while existing stored numeric values remain compatible.
5. Run the narrowest available lint or typecheck command on touched files before widening to any broader build or smoke test.

**Decisions**

- No new feature surfaces will be added. The task is to align and de-duplicate what already exists.
- JSON-backed CMS pages and blog content stay as-is unless an existing Supabase path already owns them.
- Demo-local auth and local storefront order state are treated as intentional unless the existing code already provides a supported Supabase-backed replacement.
- The main consolidation target is shared catalog data, storage wiring, route wiring, and currency formatting consistency.

**Further Considerations**

1. If you want, I can turn this into an implementation checklist that is strictly limited to catalog/admin/data-model consistency and excludes auth/order changes.
2. If you want auth to become Supabase-backed instead of demo-local, that is a separate scope and should be planned as its own pass so we do not mix two systems accidentally.
3. If you want UGX to become the default store currency, that should be treated as a configuration decision plus a formatting pass, not a separate money-model rewrite.

**Relevant files**

- `src/lib/repositories/index.ts` — shared source selection for catalog, pages, and blog repositories.
- `src/lib/repositories/json-product-repository.ts` — JSON fallback catalog source.
- `src/lib/repositories/json-category-repository.ts` — JSON category source.
- `src/lib/repositories/json-brand-repository.ts` — JSON brand source.
- `src/lib/repositories/json-page-repository.ts` — CMS page source.
- `src/lib/repositories/json-blog-repository.ts` — blog source.
- `src/lib/admin/product-admin.ts` — admin catalog helper reusing shared repositories.
- `src/lib/admin/order-admin.ts` — admin order data path.
- `src/lib/admin/product-image-storage.ts` — admin storage target for product images.
- `src/lib/supabase/server.ts` — Supabase configuration gating.
- `src/lib/env.ts` — env validation and required configuration.
- `src/store/auth.ts` — current auth state and demo users.
- `src/hooks/use-auth-guard.ts` — client-side admin gating.
- `src/app/(store)/auth/login/page.tsx` — login entry point.
- `src/app/(store)/auth/register/page.tsx` — registration entry point.
- `src/app/(store)/checkout/page.tsx` — storefront order creation path.
- `src/app/(store)/account/orders/page.tsx` — storefront order history.
- `src/app/(store)/[slug]/page.tsx` — catalog slug resolution.
- `src/app/(store)/pages/page.tsx` and `src/app/(store)/pages/[slug]/page.tsx` — CMS page surfaces.
- `src/app/(admin)/admin/layout.tsx` and `src/app/(admin)/admin/products/page.tsx` — admin access and catalog UI.
- `supabase/migrations/20260701172000_create_apmo_catalog.sql` — core catalog/auth schema.
- `supabase/migrations/20260701202500_create_admin_orders.sql` — admin order schema.
- `supabase/migrations/20260701211000_create_product_image_storage.sql` — older product image storage migration.
- `supabase/migrations/20260706190000_create_apmo_bucket_storage.sql` — newer storage migration.

**Verification**

1. Run a focused repository and route check after any changes to confirm storefront and admin still resolve through the same catalog helpers.
2. Run a focused auth/admin access check to confirm login, register, and admin guard behavior still matches the chosen auth source.
3. Run a migration/schema sanity pass to confirm the storage bucket, catalog tables, and admin expectations match one another.
4. Run the narrowest available lint or typecheck command on touched files before widening to any broader build or smoke test.

**Decisions**

- No new feature surfaces will be added. The task is to align and de-duplicate what already exists.
- JSON-backed CMS pages and blog content stay as-is unless an existing Supabase path already owns them.
- Demo-local auth and local storefront order state are treated as intentional unless the existing code already provides a supported Supabase-backed replacement.
- The main consolidation target is shared catalog data and any duplicated storage or route wiring.

**Further Considerations**

1. If you want, I can turn this into an implementation checklist that is strictly limited to catalog/admin/data-model consistency and excludes auth/order changes.
2. If you want auth to become Supabase-backed instead of demo-local, that is a separate scope and should be planned as its own pass so we do not mix two systems accidentally.
