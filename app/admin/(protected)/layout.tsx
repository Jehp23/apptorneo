import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { unstable_noStore as noStore } from "next/cache"
import { isValidAdminToken } from "@/lib/admin-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  noStore()
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value

  if (!isValidAdminToken(token)) {
    redirect("/admin/login")
  }

  return <>{children}</>
}
