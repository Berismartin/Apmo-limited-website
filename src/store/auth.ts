"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User, Address } from "@/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<boolean>
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName" | "email">>) => void
  addAddress: (address: Omit<Address, "id">) => void
  removeAddress: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const supabase = createSupabaseBrowserClient()
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          
          if (error || !data.user) return false

          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          const user: User = {
            id: data.user.id,
            email: data.user.email ?? email,
            firstName: profile?.first_name ?? "",
            lastName: profile?.last_name ?? "",
            role: profile?.role ?? "customer",
            addresses: [],
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at ?? data.user.created_at,
          }

          set({ user, isAuthenticated: true })
          return true
        } catch {
          return false
        }
      },

      register: async (data) => {
        try {
          const supabase = createSupabaseBrowserClient()
          const { data: authData, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
              }
            }
          })
          
          if (error || !authData.user) return false

          const user: User = {
            id: authData.user.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: "customer",
            addresses: [],
            createdAt: authData.user.created_at,
            updatedAt: authData.user.updated_at ?? authData.user.created_at,
          }

          set({ user, isAuthenticated: true })
          return true
        } catch {
          return false
        }
      },

      logout: async () => {
        try {
          const supabase = createSupabaseBrowserClient()
          await supabase.auth.signOut()
        } catch (err) {
          console.error(err)
        }
        set({ user: null, isAuthenticated: false })
      },

      updateProfile: (data) => {
        const user = get().user
        if (!user) return
        set({
          user: {
            ...user,
            ...data,
            updatedAt: new Date().toISOString(),
          },
        })
      },

      addAddress: (address) => {
        const user = get().user
        if (!user) return
        const newAddress: Address = {
          ...address,
          id: `addr-${Date.now()}`,
        }
        set({
          user: {
            ...user,
            addresses: [...user.addresses, newAddress],
          },
        })
      },

      removeAddress: (id) => {
        const user = get().user
        if (!user) return
        set({
          user: {
            ...user,
            addresses: user.addresses.filter((a) => a.id !== id),
          },
        })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
