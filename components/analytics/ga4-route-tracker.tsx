"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const GA_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-RM57TXML0J"

export function GA4RouteTracker() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID)
            return
        const search = searchParams.toString()
        const pagePath = pathname + (search ? `?${search}` : "")
        window.gtag("config", GA_MEASUREMENT_ID, { page_path: pagePath })
    }, [pathname, searchParams])

    return null
}
