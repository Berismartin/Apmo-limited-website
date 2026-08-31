# Apmo site audit — 404s, image uploads, UI states

Date: 2026-08-31
Scope: storefront (`src/app/(store)`) and admin (`src/app/(admin)/admin`), Next.js 16 / Supabase.

This audit is based on reading the actual source, git history, and build artifacts in this repo — not guesses. Each finding lists the file(s) involved so a fix can be scoped directly.

## Top-line summary

Three separate, unrelated problems are producing the symptoms reported:

1. **The 404s are a stale-build problem, not a broken-route problem.** One route (`/[slug]`, which serves every product/category/brand page) is hard-coded to 404 anything that wasn't known at the last `next build`. That build is from **July 9**, but the admin panel — and 7+ weeks of commits since — has kept adding/editing catalog, blog, and testimonial content. Anything created or renamed after July 9 doesn't exist as far as the live site is concerned.
2. **The slow image uploads/processing are three compounding issues**, not one: uploads go one-at-a-time to Supabase Storage, nothing resizes an image before it's stored, and Next's image optimizer is turned off for every one of those images on the way back out — so the same oversized file is uploaded slowly and served slowly, at full size, to every device.
3. **UI state coverage is inconsistent, not absent.** Admin delete flows and the main storefront checkout/login forms already do loading + disabled correctly. The gaps are specific: one raw `confirm()` popup, two forms that fake success without doing anything, and a couple of client-side navigations (sort, pagination) with no in-place pending indicator.

---

## 1. Why you're seeing 404s everywhere

### 1.1 `dynamicParams = false` on the catalog route (root cause)

**File:** `src/app/(store)/[slug]/page.tsx`, line 18.

```ts
// Only render slugs returned by generateStaticParams — any other slug
// automatically gets a proper 404 response. Rebuild/redeploy to pick
// up new products, categories, or brands.
export const dynamicParams = false
```

This single route serves every product, category, and brand page on the site (`/haircare`, `/scalp-care`, `/ritual-kits`, `/styling`, every product slug, every brand slug). `dynamicParams = false` means Next will **only** render the slugs that existed in the database at the moment `next build` ran. Any slug added, renamed, or restored afterward returns a real 404 — not a caching issue, not a CDN issue, an intentional "this page was never built" response — until someone runs a full `next build` + redeploy.

**Evidence this is actually happening:** `.next/BUILD_ID` is dated **2026-07-09**. Git history since then includes (among others):
- `4b17716` (Jul 13) — blog and testimonial management added to admin
- `8a27f9a` (Jul 13) — account pages removed, robots.txt changed
- `21f4a77` (Aug 3) — admin dashboard and order management enhancements
- `7573cdb`…`cfbb300` (Aug 27) — six commits reworking admin forms and mutation handling

That's 7 weeks of admin-facing changes running against a 7-week-old static build. Every category, product, or brand created or edited through the admin panel since July 9 is invisible to the public site.

**Why revalidation doesn't save you here:** the admin mutations do call `revalidatePath()` (see `src/lib/admin/product-admin.ts`, `category-admin.ts`, `brand-admin.ts`), which normally refreshes cached data for an *existing* page. But `dynamicParams = false` means a brand-new slug's page was never generated in the first place — there's nothing for `revalidatePath` to refresh. Revalidation and `dynamicParams = false` are fighting each other.

**Fix:** remove `dynamicParams = false` (or set it to `true`) so unknown slugs render on-demand at request time, exactly like `src/app/(store)/blog/[slug]/page.tsx` already does (it has no `dynamicParams` override — new blog posts work immediately without a rebuild). Keep `generateStaticParams` for build-time pre-rendering of known pages; on-demand rendering only kicks in for slugs outside that list. This is a one-line change and it is almost certainly your single biggest fix.

### 1.2 No deploy/rebuild pipeline visible in the repo

No `vercel.json`, `netlify.toml`, or CI workflow was found for triggering a rebuild when content changes. Even after fixing 1.1, if the site is ever deployed as a static export rather than a running Next server, this problem returns in a different form. Worth confirming: is this deployed as `next start` (a live server — fix 1.1 is sufficient) or as a static export (fix 1.1 alone won't help, you'd also need `output: export` removed or an incremental rebuild trigger on every admin save)?

### 1.3 Orphaned "Pages" (CMS) feature

**Files:** `src/lib/repositories/json-page-repository.ts`, exported as `pageRepository` from `src/lib/repositories/index.ts`.

This repository is defined but never imported by any route or admin screen. It's leftover from the original starter template (whose README still documents a `/pages/[slug]` route and an admin pages editor — neither exists in this codebase anymore, see `docs`/`README.md` "Pages" table). Not a live 404 source by itself (nothing currently links to it), but confirms the repo has drifted from its own documentation — worth deleting or finishing, so the next person doesn't build against docs that describe pages that were removed in `8a27f9a`.

### 1.4 Stale README

`README.md`'s "Project Structure" and "Pages" tables still describe an `/account` section (dashboard, orders, addresses) and a `/pages/[slug]` CMS route. Both were removed from the codebase (`8a27f9a: remove account-related pages`). No live links point at `/account` currently (checked `header.tsx`, nav config, login/register redirects — all clean), so this isn't causing user-facing 404s today, but it will mislead anyone (including a future AI assistant) who trusts the README over the code.

---

## 2. Why image uploads/processing are slow

Three separate issues stack on top of each other:

### 2.1 Uploads happen one at a time, sequentially

**File:** `src/lib/admin/product-image-storage.ts`, `uploadProductImagesFromFormData()`.

```ts
for (const file of files) {
  ...
  const { error } = await supabase.storage.from(productImageBucket).upload(...)
  ...
}
```

Each image is a separate `await`ed network round-trip to Supabase Storage, run in series. Uploading 5 product photos takes roughly 5× one photo's upload time instead of running concurrently. Fix: batch with `Promise.all` (with a small concurrency cap, e.g. 3-4 at once, so you don't hammer Supabase on a big batch).

### 2.2 Nothing resizes or compresses an image before it's stored

`sharp` is in `package.json` as a dependency but is **never imported anywhere in `src`** (confirmed by search). Images are capped at 2 MB (`MAX_IMAGE_UPLOAD_BYTES` in `src/lib/constants.ts`) but otherwise uploaded exactly as the browser produced them — full camera resolution, no downscaling, no re-encoding. A phone photo comfortably hits that 2 MB ceiling at dimensions far larger than anything the site displays (product cards, galleries).

Fix: resize/re-encode server-side with `sharp` before the Supabase upload in `uploadProductImagesFromFormData` — e.g. resize to a sane max dimension (~1600px) and re-encode as WebP. This is the highest-leverage fix in this section since it shrinks both the upload payload and everything downstream.

### 2.3 Image optimization is disabled for every product/catalog image on delivery

**Files:** `src/lib/images.ts` (`shouldUnoptimizeImage`), `src/components/ui/app-image.tsx`, `next.config.ts`.

```ts
// Supabase storage images are already resized/compressed on upload.
// Next.js 16 + Vercel image optimization often returns 400
// (INVALID_IMAGE_OPTIMIZE_REQUEST) for these hosts, so skip the optimizer.
```

The comment says images are "already resized/compressed on upload" — per 2.2, they are not. And because `AppImage` sets `unoptimized: true` for any Supabase-hosted URL, Next.js never generates resized/`WebP`/`AVIF` variants for these images at all. Every visitor, on every device (phone or 4K monitor), downloads the exact same full-size original. This is why image-heavy pages (shop grid, product gallery, blog, admin product list thumbnails) feel slow to load, independent of the upload speed problem.

This was apparently disabled to work around a real Vercel/Next 16 bug (`INVALID_IMAGE_OPTIMIZE_REQUEST`) rather than as a deliberate performance choice — so once 2.2 (server-side resize) is in place, re-test whether the optimizer 400 still reproduces; if it does, the more targeted fix is correcting the `remotePatterns`/host allowlist in `next.config.ts` rather than disabling optimization for the host entirely.

### 2.4 Client-side background removal is a full ML model running in the browser

**File:** `src/components/admin/image-uploader.tsx`.

The optional "remove background" admin feature dynamically imports `@imgly/background-removal`, which downloads an ONNX segmentation model (`isnet_fp16`) and runs it client-side via WASM (`onnxruntime-web`) — the component's own copy admits "First run may take longer while the model downloads." If an admin selects several images at once with this checkbox on, each image kicks off its own concurrent `processBackgroundRemoval()` call (no queueing), multiplying CPU/memory pressure in that browser tab simultaneously. This is expected to be slow by nature (client-side ML), but it's currently unbounded — worth queueing one-at-a-time and caching the loaded model across calls instead of (potentially) reloading it per image.

---

## 3. UI state gaps (loading / disabled / confirmation)

The good news first: `src/components/admin/delete-*-dialog.tsx` (product, order, brand, category, blog, testimonial) all follow the same solid pattern already — styled confirmation dialog, `isDeleting` state, disabled buttons, spinner. `src/components/admin/product-form.tsx` (and the other admin forms) use `useTransition`/`isPending` correctly for Save. Storefront checkout and login also disable-and-relabel their submit buttons correctly. That pattern should be the template for the fixes below, not a new one.

### 3.1 Raw browser `confirm()` instead of the app's own dialog

**File:** `src/app/(admin)/admin/customers/[id]/customer-role-form.tsx`, line 19.

This is the one place in the admin that uses `window.confirm()` for a destructive/important action (changing a customer's role) instead of the styled `Dialog` pattern used everywhere else. It's inconsistent visually, can be silently suppressed by browser popup-blocking settings, and can't show a loading state while the change is in flight. Fix: replace with the same confirmation-dialog component the delete flows already use.

### 3.2 Contact form and newsletter form fake their success state

**Files:** `src/app/(store)/contact/page.tsx`, `src/components/layout/newsletter-form.tsx`.

Both show a correct loading state and disable their submit button — but the "submission" is a hardcoded `setTimeout` that always resolves with a success toast:

```ts
setLoading(true)
// In production, send to hello@apmoug.com via an API route or form service.
setTimeout(() => {
  toast.success("Message sent! We'll get back to you soon.")
  ...
}, 500)
```

Nothing is actually sent anywhere. Visitors get a confident "confirmed" state for a message that goes nowhere. This is a functional gap wearing a correct-looking UI, which is arguably worse than an obviously-broken form — flag for whoever owns the real contact/newsletter backend before launch.

### 3.3 Client-side navigations with no pending indicator

**Files:** `src/components/products/sort-dropdown.tsx`, `src/components/products/pagination.tsx`.

Both trigger a `router.push()` to `/shop` with new query params, which re-fetches and re-renders the product grid server-side. Neither shows any local pending state on the control itself — the only feedback is whatever `src/app/(store)/shop/loading.tsx` renders for the whole route, which can be a jarring full-grid replace for what should feel like a lightweight re-sort or page flip. A small `useTransition`/`isPending` on the select and on the active pagination link (dim the grid, spinner on the control) would make this feel instant instead of flickery.

### 3.4 Missing route-level loading skeletons

**Files present:** `admin/loading.tsx`, `shop/loading.tsx`, `search/loading.tsx`, `[slug]/loading.tsx`.
**Missing for routes that fetch data:** `cart`, `checkout`, `blog`, `blog/[slug]`, `brands`, `testimonials`, `faq`, `contact`, `about`, `policies/*`.

Not every one of these needs a bespoke skeleton, but `blog`, `blog/[slug]`, `brands`, and `testimonials` all fetch from Supabase and currently have no `loading.tsx` — on a slow connection or cold Supabase read, the visitor sees nothing until the full page is ready rather than an immediate skeleton.

---

## 4. Action plan

### Phase 1 — stop the bleeding (do first, low risk, high impact)

1. Remove `dynamicParams = false` from `src/app/(store)/[slug]/page.tsx` (or set to `true`) so new/edited catalog slugs render on-demand instead of 404ing until the next full rebuild. **This is the fix for "404 everywhere."**
2. Run a fresh `next build` + redeploy immediately after, so everything created in the admin over the last 7 weeks becomes visible right away, independent of the code fix above.
3. Confirm how this site is actually deployed (long-running `next start` vs. static export) so fix #1 actually behaves as expected in production, not just in `next dev`.

### Phase 2 — fix upload/processing speed

4. Parallelize `uploadProductImagesFromFormData` in `src/lib/admin/product-image-storage.ts` (`Promise.all` with a small concurrency cap).
5. Add server-side resize/re-encode with `sharp` before upload (max ~1600px edge, WebP) in the same file — this is the biggest single win for both upload time and page-load time.
6. Re-evaluate `shouldUnoptimizeImage()` / the `unoptimized` flag in `src/lib/images.ts` and `next.config.ts` once images are properly sized — either re-enable Next's optimizer for the Supabase host or fix the `remotePatterns` config that was causing `INVALID_IMAGE_OPTIMIZE_REQUEST`, instead of disabling optimization wholesale.
7. Queue background-removal processing one image at a time in `image-uploader.tsx` instead of firing all selected images concurrently.

### Phase 3 — close UI state gaps

8. Replace the `window.confirm()` in `customer-role-form.tsx` with the existing `Dialog`-based confirmation pattern.
9. Decide on a real backend (API route or form service) for `contact/page.tsx` and `newsletter-form.tsx`, or clearly mark them as non-functional in a way that doesn't show a false "success" toast.
10. Add `isPending`/`useTransition` feedback to `sort-dropdown.tsx` and `pagination.tsx`.
11. Add `loading.tsx` skeletons to `blog`, `blog/[slug]`, `brands`, and `testimonials`.

### Phase 4 — cleanup / consistency (lower priority)

12. Either wire up or delete the orphaned `pageRepository` (`json-page-repository.ts`) — it's dead code left over from before the CMS pages feature was removed.
13. Update `README.md`'s project structure and pages tables to match the current app (no `/account`, no `/pages/[slug]`), so documentation stops contradicting the code.
14. Revisit the two product-image-storage migrations (`20260701211000_create_product_image_storage.sql` referenced in `plan.md` but no longer present, vs. `20260706190000_create_apmo_bucket_storage.sql` which defines the `apmo_bucket` bucket actually used by the code) to make sure no stale bucket/policy is left behind in the live Supabase project.

## Verification checklist

- After Phase 1: create a new category/product/brand in the admin, hit its public URL immediately without rebuilding — it should render, not 404.
- After Phase 2: time an upload of 4-5 phone-camera-resolution images before/after; confirm resulting files in Supabase Storage are meaningfully smaller; spot-check a product page's network tab to confirm images aren't full original resolution on mobile viewport.
- After Phase 3: manually exercise the customer role change, contact form, newsletter form, and shop sort/pagination controls; confirm every mutating action shows a clear pending state and either a real result or an honest failure — never a silent no-op dressed as success.

---

## Status (updated 2026-08-31)

Fixed in code:

- 1.1 — removed `dynamicParams = false` from `[slug]/page.tsx`.
- 2.1 / 2.2 — `product-image-storage.ts` now validates all files up front, resizes/re-encodes with `sharp` (max 1600px, WebP), and uploads with bounded concurrency instead of one-at-a-time.
- 2.4 — background-removal jobs in `image-uploader.tsx` now run one at a time through a queue instead of firing concurrently.
- 3.1 — `customer-role-form.tsx` now uses the same styled `Dialog` confirmation as the delete flows instead of `window.confirm()`.
- 3.2 — contact form and newsletter signup now write to real Supabase tables (`contact_messages`, `newsletter_subscribers`) via `src/lib/actions/contact.ts` instead of faking success. **New migration `supabase/migrations/20260831120000_create_contact_and_newsletter.sql` needs to be applied to the Supabase project** (e.g. `supabase db push`, or run it in the SQL editor) before these forms will work.
- 3.3 — `sort-dropdown.tsx` and `pagination.tsx` now show inline pending states (`useTransition` / `useLinkStatus`) instead of relying solely on the route-level skeleton.
- 3.4 — added `loading.tsx` for `blog`, `blog/[slug]`, `brands`, `testimonials`.
- 1.4 — README's project structure and pages table updated to drop `/account` and `/pages/[slug]`, and to list `/blog` and `/testimonials`.

Still needs a human decision / action:

- 1.2 — confirm how this site is deployed (long-running `next start` vs. static export), and **run a fresh `next build` + redeploy** now — the code fix alone doesn't retroactively publish the 7 weeks of admin content created against the July 9 build.
- 2.3 — the `unoptimized` flag for Supabase-hosted images in `src/lib/images.ts` was left as-is; re-test whether `INVALID_IMAGE_OPTIMIZE_REQUEST` still reproduces now that images are resized before upload, and re-enable Next's optimizer for that host if not.
- 2.5 / 1.3 / 1.4(migrations) — the two-bucket-migration question from `plan.md` and the orphaned `pageRepository` were left untouched; they're not causing live bugs, just repo cleanliness.

Not fixed (left as noted): 3.2's migration must be applied manually — this session cannot run `supabase db push` against your live project.

## 5. Follow-up finding: Cmd+K search was reading the wrong data source

Found after the initial pass, when asked to double check search specifically.

**File:** `src/components/search/search-modal.tsx` (the header's Cmd+K / search-icon popup — distinct from the full `/search` page, which was already correct).

The popup imported `src/data/products.json` directly and filtered it in memory, completely bypassing `productRepository` (the Supabase/JSON switch every other page uses). That JSON file is a one-time seed snapshot last touched in commit `121bec6` (July 1) — 8 products. Anything added, renamed, or removed through the admin catalog since then is out of sync with it:

- New products since July 1 don't show up in Cmd+K search at all.
- Renamed/deleted products still show up, and clicking them links to a slug the live catalog no longer has — a 404 with a different root cause than section 1's build-staleness issue.
- "Popular Searches" chips were the unmodified starter-template defaults (Headphones, Coffee, Candle, ...), unrelated to Apmo.

**Fixed:** added `src/lib/actions/search.ts` (`getSearchableProductsAction`), which fetches active products through the same `productRepository` every other page uses. `search-modal.tsx` now fetches once when first opened (cached for the session, with a loading spinner and a retry-on-error state — it had neither before) instead of reading the stale JSON file, and "Popular Searches" now pulls from `shopLinks` in `src/lib/navigation.ts` (Haircare, Scalp Care, Ritual Kits, Styling) instead of hardcoded demo terms.
