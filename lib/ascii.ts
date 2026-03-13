export type AsciiOptions = {
    maxWidth: number
    charAspectRatio?: number
    density?: string
    blockSize?: {
        x: number
        y: number
    }
}

const DEFAULT_DENSITY = "@%#*+=-:. "

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value))

export function getTargetSize(
    width: number,
    height: number,
    { maxWidth, charAspectRatio = 0.55 }: AsciiOptions
) {
    const clampedWidth = clamp(Math.floor(maxWidth), 10, 240)
    const scale = clampedWidth / width
    const targetWidth = clampedWidth
    const targetHeight = Math.max(
        1,
        Math.floor(height * scale * charAspectRatio)
    )

    return { width: targetWidth, height: targetHeight }
}

export function rgbToBrightness(r: number, g: number, b: number) {
    return 0.299 * r + 0.587 * g + 0.114 * b
}

export function brightnessToChar(
    brightness: number,
    density: string = DEFAULT_DENSITY
) {
    const value = clamp(brightness, 0, 255)
    const index = Math.floor((value / 255) * (density.length - 1))
    return density[index] ?? density[density.length - 1] ?? " "
}

export function convertImageDataToAscii(
    imageData: ImageData,
    options: AsciiOptions
): string {
    const { width, height, data } = imageData
    const {
        maxWidth,
        charAspectRatio = 0.55,
        density = DEFAULT_DENSITY,
    } = {
        ...options,
    }

    const target = getTargetSize(width, height, { maxWidth, charAspectRatio })
    const sx = width / target.width
    const sy = height / target.height

    const blockX = options.blockSize?.x ?? 1
    const blockY = options.blockSize?.y ?? 1

    let result = ""

    for (let yChar = 0; yChar < target.height; yChar += blockY) {
        for (let xChar = 0; xChar < target.width; xChar += blockX) {
            let sum = 0
            let count = 0

            for (let by = 0; by < blockY; by++) {
                const y = yChar + by
                if (y >= target.height) break

                for (let bx = 0; bx < blockX; bx++) {
                    const x = xChar + bx
                    if (x >= target.width) break

                    const srcX = Math.floor(x * sx)
                    const srcY = Math.floor(y * sy)
                    const idx = (srcY * width + srcX) * 4

                    const r = data[idx]
                    const g = data[idx + 1]
                    const b = data[idx + 2]

                    sum += rgbToBrightness(r, g, b)
                    count++
                }
            }

            const avg = count > 0 ? sum / count : 0
            result += brightnessToChar(avg, density)
        }
        result += "\n"
    }

    return result
}
