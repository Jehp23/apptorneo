const COOKIE_NAME = "admin_session"
const COOKIE_MAX_AGE = 60 * 60 * 24
// Mensaje fijo que se firma con el password. No contiene el password.
const SESSION_MESSAGE = "fanta-admin-session-v1"

async function computeHmac(password: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(SESSION_MESSAGE))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function generateAdminToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? ""
  return computeHmac(password)
}

export async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD
  if (!token || !password) return false
  const expected = await computeHmac(password)
  return token === expected
}

export function createAdminSessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  }
}

export function createAdminLogoutCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
}
