"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function DisplayAutorefresh({ enabled, intervalSeconds = 20 }: { enabled: boolean; intervalSeconds?: number }) {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds)

  useEffect(() => {
    if (!enabled) return

    setSecondsLeft(intervalSeconds)

    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          router.refresh()
          return intervalSeconds
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(countdown)
  }, [enabled, intervalSeconds, router])

  const label = useMemo(() => {
    if (!enabled) return "Refresh manual"
    return `Auto refresh ${secondsLeft}s`
  }, [enabled, secondsLeft])

  return (
    <Badge variant={enabled ? "default" : "outline"} className="gap-2 px-3 py-1 text-sm">
      <RefreshCcw className="h-4 w-4" />
      {label}
    </Badge>
  )
}
