# Implementation Plan: PageSpeed Optimization

## Findings from PageSpeed Insights
I analyzed the `.mhtml` report you provided. Here is the brief:
- **First Contentful Paint (FCP):** 0.9s (Excellent 🟢)
- **Cumulative Layout Shift (CLS):** 0 (Perfect 🟢)
- **Largest Contentful Paint (LCP):** 18.2s (Failed 🔴)
- **Est Image Savings:** ~11.0 MB

Your website is structurally fast (FCP is sub-second), but the **Largest Contentful Paint** score is severely failing. The audit explicitly flags "Improve Image Delivery" with 11MB of potential savings.

### The Root Cause
I searched your codebase and found that almost every single `<Image />` component (especially in `MasonryGrid.tsx` and `explore/page.tsx`) has the `unoptimized` prop explicitly hardcoded on it. 

When you add `unoptimized` to a Next.js Image tag, you completely bypass the built-in Next.js Image Optimizer. The browser is being forced to download raw 4MB-10MB user-uploaded images just to display a tiny 300px thumbnail card!

## Proposed Fix (Ponytail Approach)

### 1. Remove `unoptimized` from Dynamic Content
We will remove the `unoptimized` prop from all prompt images fetched from Supabase. Next.js already has your Supabase domain configured in `remotePatterns` in `next.config.ts`, so this will work out of the box!
- **Target Files:**
  - `src/components/ui/MasonryGrid.tsx`
  - `src/app/(public)/explore/page.tsx`
  - `src/components/prompt/ExpandableImage.tsx`
  - `src/app/(dashboard)/posts/page.tsx`

By removing it, Next.js will automatically:
1. Resize the heavy 4K images down to thumbnail width (e.g., `w-72` / `500px`).
2. Convert them from heavy JPEGs/PNGs into highly compressed Next-Gen `WebP` or `AVIF` formats.
3. Automatically serve the lighter images, cutting your page weight down from 15MB+ to < 1MB.

### 2. Retain `unoptimized` for tiny static assets
For very small local UI elements (like the 44px `logo.png` or pure SVG assets), keeping `unoptimized` is fine, as optimizing a 2KB image wastes server CPU. But for all Supabase Storage images, it must be removed.

## User Review Required
Removing `unoptimized` will instantly skyrocket your PageSpeed score. 

If your Vercel Image Optimization usage limit becomes a concern in the future due to high traffic, the next step would be configuring **Supabase Image Transformations** (appending `?width=500` to the Supabase URL directly). But for now, just removing `unoptimized` is the fastest and easiest win. 

Shall I proceed with ripping out `unoptimized` from the prompt grids?
