import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

const COOKIE_NAME = "admin_session"
const COOKIE_MAX_AGE = 60 * 60 * 24

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? ""
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? getAdminPassword()
}

function signPayload(payload: string) {
  const secret = getSessionSecret()
  if (!secret) return ""
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

export function isValidAdminPassword(password: string | undefined): boolean {
  const adminPassword = getAdminPassword()
  if (!password || !adminPassword) return false
  return safeEqual(password, adminPassword)
}

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false

  const [expiresAtRaw, signature] = token.split(".")
  const expiresAt = Number(expiresAtRaw)

  if (!expiresAtRaw || !signature || !Number.isFinite(expiresAt)) return false
  if (expiresAt <= Date.now()) return false

  const expectedSignature = signPayload(expiresAtRaw)
  if (!expectedSignature) return false

  return safeEqual(signature, expectedSignature)
}

export function generateAdminToken(): string {
  const expiresAt = String(Date.now() + COOKIE_MAX_AGE * 1000)
  const signature = signPayload(expiresAt)
  return `${expiresAt}.${signature}`
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  return isValidAdminToken(token)
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
