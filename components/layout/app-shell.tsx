"use client"

import { usePathname } from "next/navigation"

import { Sidebar } from "@/components/sidebar"

function shouldHideSidebar(pathname: string) {
  return pathname === "/login" || pathname === "/admin/login" || pathname === "/pantalla"
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideSidebar = shouldHideSidebar(pathname)

  return (
    <div className="flex min-h-screen">
      {!hideSidebar ? <Sidebar /> : null}
      <main className={hideSidebar ? "flex-1" : "ml-64 flex-1"}>{children}</main>
    </div>
  )
}
