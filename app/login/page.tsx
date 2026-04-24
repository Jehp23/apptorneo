import { LoginGateway } from "@/components/auth/login-gateway"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>
}) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const next = resolvedSearchParams.next
  const redirectTo = next && next.startsWith("/") ? next : "/admin"

  return <LoginGateway redirectTo={redirectTo} />
}
