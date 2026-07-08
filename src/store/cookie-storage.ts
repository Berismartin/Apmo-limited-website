import { StateStorage } from "zustand/middleware"

export const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop()?.split(";").shift() || "")
    }
    return null
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === "undefined") return
    // 30 days expiration
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${60 * 60 * 24 * 30}; path=/; samesite=lax`
  },
  removeItem: (name: string): void => {
    if (typeof document === "undefined") return
    document.cookie = `${name}=; max-age=-1; path=/`
  },
}
