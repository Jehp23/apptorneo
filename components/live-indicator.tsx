"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function LiveIndicator({ intervalSeconds = 30 }: { intervalSeconds?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh()
    }, intervalSeconds * 1000)
    return () => window.clearInterval(id)
  }, [router, intervalSeconds])

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs font-medium text-emerald-600">En vivo</span>
    </div>
  )
}
