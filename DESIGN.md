# Design System: ChessMate Core (Nordic Industrial Precision)
**Project ID:** `chessmate-core-v2`
**DFII Score:** 14/15 (Aesthetic Impact: 5, Context Fit: 5, Implementation Feasibility: 5, Performance Safety: 5, Consistency Risk: 1)

## 1. Visual Theme & Atmosphere
An austere, high-craft **Nordic Industrial Precision (Swiss Utilitarian)** interface. Inspired by high-end horology timing instruments, aerospace telemetry consoles, and tournament chess clocks. The interface completely rejects decorative illustrations, emoji icons, tacky neon gradients, and AI sparkles. Every element is defined strictly through typographic hierarchy, monospaced numerical readouts, mechanical hair-line borders, and intentional spatial rhythm.

## 2. Color Palette & Roles
* **Base Obsidian Canvas** (`#0c0e12`): Matte deep black foundation providing maximum visual stability.
* **Machined Carbon Panel** (`#14171d`): Tactile container surface for cards and toolbars.
* **Deep Well Input** (`#090a0d`): Recessed background for text fields, selectors, and terminal outputs.
* **Structural Hairline** (`rgba(255, 255, 255, 0.08)`): Ultra-fine boundary demarcation with zero visual bloat.
* **Signal Amber Ochre** (`#e59b2c`): Primary action accent, focus state, active tags, and highlighted moves.
* **Telemetry Cyan** (`#2dd4bf`): Diagnostic verification indicator and positive evaluation scores.
* **Signal Alert Red** (`#ef4444`): Window exit actions and diagnostic error states.
* **Titanium White** (`#ffffff`): High-contrast primary headings and critical values.
* **Graphite Ash** (`#808893`): Muted technical captions and metadata labels.

## 3. Typography & Numerical Readouts
* **Primary System:** Monolithic Sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`) with snug tracking (`-0.01em` to `0.8px` for uppercase labels).
* **Telemetry Monospace:** System monospace (`ui-monospace, SFMono-Regular, Menlo, monospace`) for evaluation metrics (`+1.40`, `D18`), FEN strings, and diagnostic terminal outputs.
* **Strictly Icon-Free:** Zero emojis, zero icon fonts, zero decorative SVGs. Functionality and identity are conveyed 100% through typography, layout hierarchy, and status badges (`[SẴN SÀNG]`, `[XONG]`, `[-]`, `[X]`).

## 4. Component Stylings & Layout Fixes
* **Grid & Alignment Integrity:**
  - 100% strict `box-sizing: border-box` across all components.
  - Side-by-side elements use CSS Grid (`grid-template-columns: 1fr 1fr; gap: 8px;`) ensuring zero row displacement or vertical drift.
  - Inputs and buttons have unified fixed heights (`32px` / `34px`) for seamless cross-row baseline alignment.
* **Segmented Controls:**
  - Inset carbon housing with two equal-width tabs (`flex: 1`).
  - Active tab is highlighted with subtle border definition and white typography.
* **Diagnostic Console (Test All):**
  - Integrated monospace output console displaying step-by-step verification without modal popups or layout shifts.
* **Floating Chat HUD Window:**
  - Rectangular architectural silhouette (`border-radius: 4px`), sharp corners, solid dark carbon opacity (`rgba(12, 14, 18, 0.98)`).
  - Floating bubble when minimized: Compact architectural badge `[CHESSMATE // CORE]` with zero icons.

## 5. Differentiation Anchor
> "This avoids generic AI UI by replacing round emoji sparkles and neon purples with an uncompromising Swiss Industrial precision layout, where every single state is communicated through typography, monospace telemetry, and tactile line geometry."
