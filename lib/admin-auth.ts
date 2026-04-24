import { cookies } from "next/headers"
import { createHash, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

export const ADMIN_COOKIE_NAME = "admin_session"

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? ""
}

/** SHA-256 of "admin:" + password — deterministic, no expiry needed */
export function computeSessionToken(password: string): string {
  return createHash("sha256").update(`admin:${password}`).digest("hex")
}

export function isValidAdminPassword(password: string | undefined): boolean {
  const adminPassword = getAdminPassword()
  if (!password || !adminPassword) return false
  const a = Buffer.from(password)
  const b = Buffer.from(adminPassword)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function generateAdminToken(): string {
  return computeSessionToken(getAdminPassword())
}

export function isValidAdminToken(value: string | undefined): boolean {
  const password = getAdminPassword()
  if (!value || !password) return false
  const expected = computeSessionToken(password)
  const a = Buffer.from(value)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return isValidAdminToken(value)
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export function createAdminSessionCookie(token: string) {
  return {
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}

export function createAdminLogoutCookie() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
}
