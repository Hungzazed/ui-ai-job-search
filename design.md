# Design — AI Career Agent

A locked design system for this app. Every page redesign reads this file before emitting code. Do not regenerate per page — extend or amend this file when the system needs to grow.

## Genre
modern-minimal

## Macrostructure family
- Dashboard / App pages: **Workbench** (high information density, crisp micro-borders, toolbars, split screens, OKLCH high-contrast accents, mono font for AI scores and metrics)

## Theme
- `--color-paper`: oklch(0.985 0.005 250)
- `--color-paper-2`: oklch(0.965 0.008 250)
- `--color-ink`: oklch(0.14 0.02 260)
- `--color-ink-2`: oklch(0.42 0.02 260)
- `--color-rule`: oklch(0.91 0.01 250)
- `--color-accent`: oklch(0.58 0.24 280)
- `--color-accent-ink`: oklch(0.98 0 0)
- `--color-focus`: oklch(0.58 0.24 280)
- `--color-success`: oklch(0.65 0.19 150)
- `--color-warning`: oklch(0.72 0.16 70)

## Typography
- Display: Inter, weight 600–700, style normal (roman upright, no italic headers)
- Body: Inter, weight 400–500, style normal
- Mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace (used for scores, percentages, KPI counts, match badges)
- Display tracking: -0.025em

## Spacing
4-point named scale (`--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`, `--spacing-xl`)

## Motion
- Stance: motion-cut (fast, crisp opacity & transform micro-transitions, <= 150ms)

## Microinteractions stance
- Status pills with status dots instead of generic badges
- Focus visible 2px offset ring
- Active pressed-down feel (`active:translate-y-[1px]`)

## CTA voice
- Primary CTA: Solid AI Violet fill (`bg-accent text-accent-ink`), rounded-lg, font-medium
- Secondary CTA: Crisp border (`border border-rule bg-paper hover:bg-paper-2`)

## What pages MUST share
- The wordmark / logotype (`AI Career Agent`)
- The accent color and its placement (<= 5% per viewport)
- The display + body + mono fonts
- Hairline borders (`border-slate-200/80` or `border-rule`)
- Anti-slop rule: **No blurred gradient clouds or blur blobs**
