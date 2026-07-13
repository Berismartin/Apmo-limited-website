"use client"

import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu, X, Store, Newspaper, MessageSquareQuote } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useAuthStore } from "@/store/auth"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { ReactNode } from "react"

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: ShoppingBag },
  { name: "Orders", href: "/admin/orders", icon: Package },
  { name: "Blog", href: "/admin/blog", icon: Newspaper },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { name: "Customers", href: "/admin/customers", icon: Users },
]

function NavLink({ item, onClick }: { item: typeof adminNav[0]; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive =
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)

  return (
    <Link
      key={item.name}
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
        isActive
          ? "bg-rose-50 text-[#351426] font-semibold"
          : "text-muted-foreground hover:bg-rose-50 hover:text-[#351426]"
      }`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.name}
    </Link>
  )
}

function AdminTopBar() {
  const { user } = useAuthGuard()
  const logout = useAuthStore((s) => s.logout)
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentPage =
    adminNav.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)))
      ?.name ?? "Admin"

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-rose-100 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">
        {/* Left: mobile menu toggle + page name */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-rose-50 hover:text-[#351426] lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold text-[#351426] lg:hidden">{currentPage}</span>
        </div>

        {/* Right: user chip + logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-rose-50 hover:text-[#351426] sm:flex"
          >
            <Store className="h-3.5 w-3.5" />
            View Store
          </Link>
          {user && (
            <div className="flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                {user.firstName?.[0]?.toUpperCase() ?? "A"}
              </div>
              <span className="hidden text-xs font-medium text-[#351426] sm:block">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <nav
            className="absolute left-0 top-16 bottom-0 w-72 overflow-y-auto bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 p-4">
              {adminNav.map((item) => (
                <NavLink key={item.name} item={item} onClick={() => setMobileOpen(false)} />
              ))}
            </div>
            <div className="border-t border-rose-100 p-4">
              <Link
                href="/"
                className="block rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-rose-50 hover:text-[#351426]"
                onClick={() => setMobileOpen(false)}
              >
                ← Back to Store
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, isReady } = useAuthGuard()

  if (!isReady) return null

  if (user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You need admin privileges to access this page.
          </p>
          <Link href="/" className="mt-4 inline-block text-sm underline">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#fff8f1]">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-72 flex-col border-r border-rose-100 bg-white/90 shadow-xl shadow-rose-950/5 lg:flex">
        <div className="flex h-20 items-center border-b border-rose-100 px-6">
          <Link href="/admin" className="relative block h-14 w-40" aria-label="Apmo admin dashboard">
            <Image
              src="/images/site_images/logo.png"
              alt="Apmo logo"
              fill
              sizes="160px"
              className="object-contain object-left"
            />
          </Link>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">
            Admin Portal
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage catalog, orders, blog, testimonials, customers, and fulfilment.
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {adminNav.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>
        <div className="border-t border-rose-100 p-4">
          <Link
            href="/"
            className="block rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-rose-50 hover:text-[#351426]"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
