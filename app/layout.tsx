import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"

import "./globals.css"
import { GA4RouteTracker } from "@/components/analytics/ga4-route-tracker"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const gaId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-RM57TXML0J"

const siteUrl = new URL("https://ascii-art.manthaa.dev")

export const metadata: Metadata = {
    title: {
        default: "ASCII Studio – Image to ASCII Art Generator",
        template: "%s | ASCII Studio",
    },
    description:
        "Convert images to clean, high-quality ASCII art directly in your browser. Drop an image, tune resolution and density, and export PNG or text instantly.",
    metadataBase: siteUrl,
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        url: siteUrl,
        title: "ASCII Studio – Image to ASCII Art Generator",
        description:
            "Drop an image, tune resolution and density, and get beautiful ASCII output. Supports PNG, JPG, GIF, and WEBP with export to PNG or .txt.",
        siteName: "ASCII Studio",
        images: [
            {
                url: "/og-image-main.png",
                width: 1200,
                height: 630,
                alt: "ASCII Studio – Image to ASCII Art Generator preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "ASCII Studio – Image to ASCII Art Generator",
        description:
            "Generate clean ASCII art from images with adjustable resolution and density presets, right in your browser.",
        images: ["/og-image-main.png"],
    },
    keywords: [
        "ASCII art generator",
        "image to ASCII",
        "ASCII Studio",
        "text art",
        "online ASCII converter",
        "PNG to ASCII",
        "JPG to ASCII",
        "GIF to ASCII",
    ],
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
})

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                "antialiased",
                fontMono.variable,
                "font-sans",
                inter.variable
            )}
        >
            <body>
                <ThemeProvider>{children}</ThemeProvider>
                <GA4RouteTracker />
            </body>
            {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        </html>
    )
}
