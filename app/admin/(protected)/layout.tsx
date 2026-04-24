import { unstable_noStore as noStore } from "next/cache"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  noStore()
  return <>{children}</>
}
