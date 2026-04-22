import crypto from "crypto"

const COOKIE_NAME = "admin_session"
const COOKIE_MAX_AGE = 60 * 60 * 24

const password = process.env.ADMIN_PASSWORD ?? ""
const secret = process.env.ADMIN_SECRET ?? ""

export function createAdminToken() {
  return crypto.createHmac("sha256", secret).update(password).digest("hex")
}

export function isValidAdminToken(token: string | undefined) {
  if (!token || !password || !secret) {
    return false
  }
  return token === createAdminToken()
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
