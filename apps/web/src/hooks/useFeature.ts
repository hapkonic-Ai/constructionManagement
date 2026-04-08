"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export function useFeature(featureCode: string) {
  const { data: session } = useSession()
  const role = (session?.user as { role?: string } | undefined)?.role
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!session) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch("/api/features", { cache: "no-store" })
        const payload = await res.json()
        if (!mounted) return

        const nextFlags: Record<string, boolean> = {}
        if (Array.isArray(payload?.data)) {
          for (const row of payload.data) {
            if (typeof row.code === "string") {
              nextFlags[row.code] = !!row.enabled
            }
          }
        }
        setFlags(nextFlags)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [session])

  return {
    isEnabled: !!role && !!flags[featureCode],
    isLoading,
    role
  }
}
