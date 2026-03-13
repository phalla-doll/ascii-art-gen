import {
    brightnessToChar,
    convertImageDataToAscii,
    getTargetSize,
} from "./ascii"

function createImageData(
    width: number,
    height: number,
    value: number
): ImageData {
    const data = new Uint8ClampedArray(width * height * 4)
    for (let i = 0; i < data.length; i += 4) {
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 255
    }
    // eslint-disable-next-line compat/compat
    return new ImageData(data, width, height)
}

describe("ascii utilities", () => {
    it("maps brightness to expected characters", () => {
        const density = "@%#*+=-:. "

        expect(brightnessToChar(0, density)).toBe("@")
        expect(brightnessToChar(255, density)).toBe(" ")
    })

    it("computes target size based on aspect ratio", () => {
        const size = getTargetSize(800, 400, {
            maxWidth: 100,
            charAspectRatio: 0.5,
        })
        expect(size.width).toBe(100)
        expect(size.height).toBeGreaterThan(0)
    })

    it("converts image data to ascii grid", () => {
        const imageData = createImageData(10, 10, 0)
        const ascii = convertImageDataToAscii(imageData, {
            maxWidth: 10,
            blockSize: { x: 2, y: 2 },
        })

        const lines = ascii.trim().split("\n")
        expect(lines.length).toBeGreaterThan(0)
        expect(lines[0].length).toBeGreaterThan(0)
    })
})
