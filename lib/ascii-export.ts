export type AsciiGrid = {
    lines: string[]
    rows: number
    cols: number
}

export function measureAsciiGrid(ascii: string): AsciiGrid {
    const normalized = ascii.replace(/\r\n/g, "\n")
    const rawLines = normalized.split("\n")
    const lines =
        rawLines.length > 0 && rawLines[rawLines.length - 1] === ""
            ? rawLines.slice(0, -1)
            : rawLines

    let cols = 0
    for (const line of lines) cols = Math.max(cols, line.length)

    return {
        lines,
        rows: lines.length,
        cols,
    }
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

function cssVarToRgbString(varName: string) {
    const probe = document.createElement("div")
    probe.style.backgroundColor = `var(${varName})`
    probe.style.position = "absolute"
    probe.style.left = "-99999px"
    probe.style.top = "-99999px"
    probe.style.width = "1px"
    probe.style.height = "1px"
    document.body.appendChild(probe)
    const color = getComputedStyle(probe).backgroundColor
    probe.remove()
    return color || "rgb(0,0,0)"
}

export type ExportPngOptions = {
    filename?: string
    font?: string
    fontSizePx?: number
    lineHeightMultiplier?: number
    paddingPx?: number
    maxCanvasPx?: number
}

export async function exportAsciiToPng(
    ascii: string,
    options: ExportPngOptions = {}
) {
    const {
        filename = "ascii-art.png",
        font = "12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSizePx = 12,
        lineHeightMultiplier = 1.1,
        paddingPx = 16,
        maxCanvasPx = 4096,
    } = options

    const grid = measureAsciiGrid(ascii)
    if (grid.rows === 0 || grid.cols === 0) {
        throw new Error("No ASCII output to export.")
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas not supported in this browser.")

    ctx.font = font
    ctx.textBaseline = "top"

    const metrics = ctx.measureText("M")
    const charWidth = Math.max(1, Math.ceil(metrics.width))
    const lineHeight = Math.max(1, Math.ceil(fontSizePx * lineHeightMultiplier))

    const desiredWidth = paddingPx * 2 + grid.cols * charWidth
    const desiredHeight = paddingPx * 2 + grid.rows * lineHeight

    const scale = Math.min(
        maxCanvasPx / desiredWidth,
        maxCanvasPx / desiredHeight,
        1
    )

    canvas.width = Math.max(1, Math.floor(desiredWidth * scale))
    canvas.height = Math.max(1, Math.floor(desiredHeight * scale))

    ctx.setTransform(scale, 0, 0, scale, 0, 0)

    const background = cssVarToRgbString("--background")
    const foreground = cssVarToRgbString("--foreground")

    ctx.fillStyle = background
    ctx.fillRect(0, 0, desiredWidth, desiredHeight)

    ctx.fillStyle = foreground
    ctx.font = font

    for (let row = 0; row < grid.lines.length; row++) {
        const line = grid.lines[row] ?? ""
        ctx.fillText(line, paddingPx, paddingPx + row * lineHeight)
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
            if (!b) reject(new Error("Failed to export PNG."))
            else resolve(b)
        }, "image/png")
    })

    downloadBlob(blob, filename)
}
