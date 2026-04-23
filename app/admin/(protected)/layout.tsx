import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { isValidAdminToken } from "@/lib/admin-auth"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value

  if (!(await isValidAdminToken(token))) {
    redirect("/admin/login")
  }

  return <>{children}</>
}
