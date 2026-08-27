export const AUTH_COOKIE_NAME = "apmo-auth-token"

const maxAgeSeconds = 60 * 60 * 24 * 7

export function writeAuthCookie(token: string | null) {
  if (typeof document === "undefined") return
  if (token) {
    const secure = window.location.protocol === "https:" ? "; secure" : ""
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure}`
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`
  }
}
