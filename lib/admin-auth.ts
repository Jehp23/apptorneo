const COOKIE_NAME = "admin_session"
const COOKIE_MAX_AGE = 60 * 60 * 24

const password = process.env.ADMIN_PASSWORD ?? ""
const secret = process.env.ADMIN_SECRET ?? ""

async function createHmacSha256(message: string, key: string) {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function createAdminToken() {
  if (!password || !secret) {
    return ""
  }

  return createHmacSha256(password, secret)
}

export async function isValidAdminToken(token: string | undefined) {
  if (!token || !password || !secret) {
    return false
  }

  const expected = await createAdminToken()
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
