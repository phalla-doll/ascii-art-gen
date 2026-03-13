import { measureAsciiGrid } from "./ascii-export"

describe("measureAsciiGrid", () => {
    it("handles empty ascii", () => {
        const grid = measureAsciiGrid("")
        expect(grid.rows).toBe(0)
        expect(grid.cols).toBe(0)
        expect(grid.lines).toEqual([])
    })

    it("measures rows and max cols", () => {
        const grid = measureAsciiGrid("abc\nde\n")
        expect(grid.rows).toBe(2)
        expect(grid.cols).toBe(3)
        expect(grid.lines).toEqual(["abc", "de"])
    })

    it("normalizes CRLF", () => {
        const grid = measureAsciiGrid("a\r\nbb\r\n")
        expect(grid.rows).toBe(2)
        expect(grid.cols).toBe(2)
        expect(grid.lines).toEqual(["a", "bb"])
    })
})
