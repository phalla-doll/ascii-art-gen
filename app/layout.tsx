import type { Metadata } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const siteUrl = new URL("https://ascii-gen.manthaa.dev")

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
    },
    twitter: {
        card: "summary_large_image",
        title: "ASCII Studio – Image to ASCII Art Generator",
        description:
            "Generate clean ASCII art from images with adjustable resolution and density presets, right in your browser.",
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
            </body>
        </html>
    )
}
