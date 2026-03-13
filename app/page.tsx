"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { convertImageDataToAscii, type AsciiOptions } from "@/lib/ascii"
import { exportAsciiToPng } from "@/lib/ascii-export"

type DensityPreset = {
    id: string
    name: string
    value: string
}

const DENSITY_PRESETS: DensityPreset[] = [
    { id: "light", name: "Light", value: "#*+=-:. " },
    { id: "default", name: "Balanced", value: "@%#*+=-:. " },
    { id: "dense", name: "High", value: "@$B%8&WM#*oahkbdpqwmZ0QLCJUYX" },
]

function useAsciiConverter() {
    const [file, setFile] = useState<File | null>(null)
    const [maxWidth, setMaxWidth] = useState(120)
    const [densityId, setDensityId] = useState<string>("default")
    const [ascii, setAscii] = useState<string>("")
    const [isConverting, setIsConverting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const density = useMemo(() => {
        const preset = DENSITY_PRESETS.find((p) => p.id === densityId)
        return preset?.value ?? DENSITY_PRESETS[0]?.value ?? "@%#*+=-:. "
    }, [densityId])

    const options: AsciiOptions = useMemo(
        () => ({
            maxWidth,
            density,
            charAspectRatio: 0.55,
            blockSize: { x: 2, y: 3 },
        }),
        [maxWidth, density]
    )

    const convert = useCallback(
        async (imageFile: File) => {
            setIsConverting(true)
            setError(null)

            try {
                const url = URL.createObjectURL(imageFile)
                const img = new Image()
                img.src = url

                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve()
                    img.onerror = () =>
                        reject(new Error("Failed to load image"))
                })

                const canvas =
                    canvasRef.current ?? document.createElement("canvas")
                const ctx = canvas.getContext("2d")

                if (!ctx) {
                    throw new Error("Canvas not supported in this browser.")
                }

                canvas.width = img.naturalWidth || img.width
                canvas.height = img.naturalHeight || img.height

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

                const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )
                const asciiArt = convertImageDataToAscii(imageData, options)
                setAscii(asciiArt)
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Unexpected error during conversion."
                setError(message)
            } finally {
                setIsConverting(false)
            }
        },
        [options]
    )

    useEffect(() => {
        if (!file) return
        void convert(file)
    }, [file, convert])

    const onFilesSelected = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return

        const image = files[0]
        if (!image.type.startsWith("image/")) {
            setError("Please select an image file.")
            return
        }

        setFile(image)
    }, [])

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLButtonElement>) => {
            event.preventDefault()
            event.stopPropagation()

            const files = event.dataTransfer?.files
            onFilesSelected(files)
        },
        [onFilesSelected]
    )

    const onPaste = useCallback(
        (event: React.ClipboardEvent<HTMLButtonElement>) => {
            const items = event.clipboardData?.files
            if (items && items.length > 0) {
                onFilesSelected(items)
            }
        },
        [onFilesSelected]
    )

    const onCopy = useCallback(async () => {
        if (!ascii.trim()) return
        try {
            await navigator.clipboard.writeText(ascii)
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Could not copy to clipboard."
            setError(message)
        }
    }, [ascii])

    const onDownload = useCallback(() => {
        if (!ascii.trim()) return
        const blob = new Blob([ascii], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "ascii-art.txt"
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    }, [ascii])

    const onExportPng = useCallback(async () => {
        if (!ascii.trim()) return
        setError(null)
        try {
            await exportAsciiToPng(ascii, {
                filename: "ascii-art.png",
                font: "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSizePx: 12,
                lineHeightMultiplier: 1.1,
                paddingPx: 16,
                maxCanvasPx: 4096,
            })
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Could not export PNG."
            setError(message)
        }
    }, [ascii])

    return {
        ascii,
        isConverting,
        error,
        file,
        maxWidth,
        densityId,
        canvasRef,
        setMaxWidth,
        setDensityId,
        onFilesSelected,
        onDrop,
        onPaste,
        onCopy,
        onDownload,
        onExportPng,
    }
}

export default function Page() {
    const {
        ascii,
        isConverting,
        error,
        file,
        maxWidth,
        densityId,
        canvasRef,
        setMaxWidth,
        setDensityId,
        onFilesSelected,
        onDrop,
        onPaste,
        onCopy,
        onDownload,
        onExportPng,
    } = useAsciiConverter()

    return (
        <main className="flex min-h-svh flex-col bg-background text-foreground overflow-x-hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-start gap-6 px-4 py-6 md:px-8 md:py-10 md:justify-center">
                <header className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            ASCII Studio
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Drop an image, tune resolution and density, and get
                            clean ASCII output.
                        </p>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                        Press <Kbd>d</Kbd> to toggle dark mode
                    </p>
                </header>

                <section className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
                    <div className="flex min-h-[260px] max-h-[720px] flex-col overflow-hidden rounded-xl border bg-card">
                        <div className="flex h-[41px] items-center justify-between gap-2 border-b px-3">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Image input
                            </p>
                        </div>

                        <div className="flex-1 space-y-4 overflow-auto px-3 py-3 text-sm">
                            <button
                                onDragOver={(event) => {
                                    event.preventDefault()
                                    event.dataTransfer.dropEffect = "copy"
                                }}
                                onDrop={onDrop}
                                onPaste={onPaste}
                                type="button"
                                className="group relative flex w-full flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm transition outline-none hover:border-primary/60 hover:bg-muted/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={(event) =>
                                        onFilesSelected(event.target.files)
                                    }
                                />
                                <div className="pointer-events-none flex w-full flex-col gap-2">
                                    <p className="w-full font-medium wrap-break-word">
                                        {file
                                            ? file.name
                                            : "Drop an image here or click to upload"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG, GIF, or WEBP. You can also
                                        paste from clipboard.
                                    </p>
                                </div>
                            </button>

                            <div className="space-y-4 rounded-xl border bg-card p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Resolution [
                                            <span className="font-mono font-semibold">
                                                {maxWidth}
                                            </span>{" "}
                                            CHRS]
                                        </p>
                                    </div>
                                    <div className="w-full max-w-xs">
                                        <Slider
                                            min={40}
                                            max={220}
                                            step={1}
                                            value={[maxWidth]}
                                            onValueChange={(value) => {
                                                const next = Array.isArray(
                                                    value
                                                )
                                                    ? value[0]
                                                    : value
                                                setMaxWidth(next ?? 120)
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            Density preset
                                        </p>
                                        <ToggleGroup
                                            type="single"
                                            value={densityId}
                                            onValueChange={(next) => {
                                                if (next) setDensityId(next)
                                            }}
                                            variant="outline"
                                            size="sm"
                                        >
                                            {DENSITY_PRESETS.map((preset) => (
                                                <ToggleGroupItem
                                                    key={preset.id}
                                                    value={preset.id}
                                                >
                                                    {preset.name}
                                                </ToggleGroupItem>
                                            ))}
                                        </ToggleGroup>
                                    </div>
                                </div>
                            </div>

                            {error ? (
                                <p className="text-xs text-destructive">
                                    {error}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex min-h-[260px] max-h-[720px] flex-col rounded-xl border bg-card">
                        <div className="flex h-[41px] items-center justify-between gap-2 border-b px-3">
                            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                ASCII output
                            </p>
                            <div className="flex flex-wrap gap-1.5 md:flex-nowrap md:justify-end">
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={onExportPng}
                                    disabled={!ascii.trim()}
                                    title="Exports with theme colors"
                                >
                                    Export PNG
                                </Button>
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={onCopy}
                                    disabled={!ascii.trim()}
                                >
                                    Copy
                                </Button>
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="outline"
                                    onClick={onDownload}
                                    disabled={!ascii.trim()}
                                >
                                    Download .txt
                                </Button>
                            </div>
                        </div>

                        <div className="relative flex-1">
                            <pre className="flex h-full w-full items-center justify-center overflow-auto bg-transparent px-3 py-6 text-center font-mono text-[10px] leading-[1.05] md:text-[11px]">
                                {isConverting
                                    ? "Converting image to ASCII..."
                                    : ascii ||
                                      "Your ASCII art will appear here after you upload an image."}
                            </pre>
                        </div>
                    </div>
                </section>
            </div>

            <canvas ref={canvasRef} className="hidden" tabIndex={-1} />
        </main>
    )
}
