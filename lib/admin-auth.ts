const COOKIE_NAME = "admin_session"
const COOKIE_MAX_AGE = 60 * 60 * 24

export function isValidAdminToken(token: string | undefined): boolean {
  const password = process.env.ADMIN_PASSWORD
  if (!token || !password) return false
  return token === password
}

export function generateAdminToken(): string {
  return process.env.ADMIN_PASSWORD ?? ""
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
