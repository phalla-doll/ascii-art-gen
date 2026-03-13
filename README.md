## ASCII Studio – Image to ASCII Art

ASCII Studio is a web app that converts images into ASCII art directly in the browser. You can upload or drag & drop an image (or paste from the clipboard), tweak resolution and character density, then copy, download, or export the ASCII output as a PNG.

![ASCII Studio OG preview](https://github.com/phalla-doll/ascii-art-gen/blob/main/public/og-image-main.png)

---

## Tech Stack

- **Framework**: Next.js (React, App Router)
- **Language**: TypeScript
- **UI Library**: `shadcn/ui` (Radix-based, accessible components)
- **Styling**: Tailwind CSS
- **Rendering / Processing**:
  - HTML Canvas API for loading, downscaling, and reading pixel data
  - Browser-based luminance calculation to convert RGB → brightness
  - Brightness-to-ASCII mapping with configurable density strings
- **Tooling**:
  - ESLint & Prettier (where configured in this repo)
  - pnpm / npm for dependency management

---

## How It Works (Pipeline)

At a high level, the app runs this pipeline in the browser:

1. **Image upload**
   - User selects or drag & drops an image.
   - The image is loaded into an off-screen `<img>` element.
2. **Draw to canvas**
   - The image is drawn to a hidden `<canvas>` at a downscaled resolution.
3. **Downscale**
   - The image width is clamped (e.g. ~80–200 characters wide).
   - Height is computed from the aspect ratio and a character aspect factor (e.g. `0.55` to account for tall characters).
4. **Convert pixels → grayscale**
   - For each pixel (or pixel block), we compute brightness using luminance:
     - `brightness = 0.299R + 0.587G + 0.114B`
5. **Map brightness → ASCII characters**
   - A density string is used, for example: `@%#*+=-:. `
   - Dark pixels map to denser characters, light pixels to sparser characters.
6. **Build ASCII rows**
   - Characters are appended row by row into a string.
   - Newlines separate rows to form the final ASCII art.
7. **Render**
   - The ASCII output is rendered inside a `<pre>` block to preserve spacing.

For performance and readability, the app can also treat **blocks of pixels** (e.g. `6×10`) as a single character and use the average brightness of each block.

---

## Core Features

- **Image → ASCII conversion**
  - Upload, drag & drop, or paste an image from the clipboard.
  - Conversion runs fully in the browser using the Canvas API.
- **Adjustable resolution**
  - Slider to control output width (in characters).
  - Height is derived automatically from the image aspect ratio and character aspect ratio.
- **Density presets**
  - Toggle between multiple character sets (Light, Balanced, High).
- **Export & sharing**
  - Copy ASCII to clipboard.
  - Download ASCII as a `.txt` file.
  - Export ASCII as a `.png` image with proper monospace rendering.
- **Polished UI**
  - Responsive, ShadCN-based layout with dark/light themes (toggleable via keyboard shortcut).

---

## ShadCN / UI Usage

The UI is built with `shadcn/ui` components on top of Radix primitives. Examples of components used (or planned) include:

- `Button` for primary actions (convert, copy, export)
- `Card` for grouping upload and preview sections
- `Slider` for resolution and density controls
- `Select` / `Tabs` for choosing density presets or modes

Components are imported in the standard way, for example:

```tsx
import { Button } from "@/components/ui/button";
```

---

## Getting Started

Install dependencies:

```bash
pnpm install
# or
npm install
```

Run the dev server:

```bash
pnpm dev
# or
npm run dev
```

Then open `http://localhost:3000` in your browser to access ASCII Studio.

---

## Roadmap & Advanced Ideas

These are optional stretch goals that may be added over time:

- **Color ASCII**
  - Map RGB values to colored `<span>` elements around each character.
- **Edge-detection mode**
  - Apply a Sobel filter to emphasize edges before mapping to ASCII.
- **Video / webcam ASCII**
  - Process each frame of a video or webcam stream through the same pipeline.
- **GPU acceleration**
  - Experiment with WebGL / WebGPU to process frames in real time.
- **Font-rasterization-based mapping**
  - Calibrate character density by actually rasterizing glyphs to a canvas and building a more accurate brightness → character lookup.

This makes ASCII Studio a strong portfolio project that showcases frontend performance, Canvas work, and modern UI with ShadCN components.
