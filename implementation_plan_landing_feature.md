# Implementation Plan: Feature Highlight Section (Pinterest-Style)

## Objective
To add a premium, visually engaging "Feature Highlight Section" immediately after the Hero section on the Landing Page. This section will closely follow the Pinterest design language (50/50 split layout, large imagery, floating UI tags, and clean typography) while being specifically tailored to the Mira Prompts brand. The `Footer` component is already integrated at the bottom of the Landing page and will be maintained.

## 1. Architectural Placement
- **Location:** Inside `src/components/home/LandingPage.tsx`, directly below the `Hero + Waterfall` section, replacing or preceding the current "Value Props" section.
- **Layout Structure:** A responsive 50/50 split layout. On desktop, it's side-by-side (`grid-cols-2`). On mobile, it stacks vertically with the visual column on top.

## 2. Design System & Styling (Tasteskill)
- **Background:** Pure White (`bg-white`) for the main section to keep it clean.
- **Visual Column (Left):**
  - **Backdrop:** A large card with a soft off-white/gray background (`bg-[#F0F0F0]`) and heavily rounded corners (`rounded-[32px]` or `rounded-[40px]`).
  - **Imagery:** A dynamic arrangement of high-quality AI images overlapping each other. We will use images from the passed `prompts` array to ensure they look native to Mira Prompts.
  - **Floating UI Tags:** Small, pill-shaped chips floating over the images to simulate interaction. 
    - *Style:* `bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2`.
    - *Content:* Minimalist icons + text (e.g., "✨ Cinematic lighting", "🔍 Photorealistic").
- **Content Column (Right):**
  - **Alignment:** Left-aligned, vertically centered.
  - **Headline:** Bold, clean sans-serif (`text-5xl font-black tracking-tight text-black leading-tight`). 
    - *Copy:* "Find the exact prompt for your vision."
  - **Subheadline:** Relaxed, readable body copy (`text-xl text-gray-500 mt-4 leading-relaxed`).
    - *Copy:* "Stop guessing. Browse thousands of curated AI image prompts and copy them directly into Midjourney, DALL·E, or Stable Diffusion with a single click."
  - **CTA Button:** Vibrant red pill (`bg-red-500 text-white font-bold rounded-full px-8 py-4 mt-8 hover:scale-105 transition-transform`).
    - *Copy:* "Join Mira Prompts" or "Start Exploring".

## 3. Technical Implementation Details
I will update `src/components/home/LandingPage.tsx`:
```tsx
{/* ─── FEATURE HIGHLIGHT SECTION ─── */}
<section className="relative z-10 bg-white py-24 px-6">
  <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
    
    {/* Visual Column */}
    <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-[#F0F0F0] rounded-[40px] flex items-center justify-center p-8 overflow-hidden">
      {/* Dynamic Image Arrangement using prompts[0] and prompts[1] */}
      {/* Floating UI Tags positioned absolute */}
    </div>

    {/* Content Column */}
    <div className="flex flex-col items-start text-left">
      <h2 className="text-4xl md:text-5xl font-black text-black tracking-tight leading-[1.1]">
        Find the exact prompt for your vision
      </h2>
      <p className="text-xl text-gray-500 mt-6 leading-relaxed max-w-md">
        Stop guessing. Browse thousands of curated AI image prompts and copy them directly into Midjourney, DALL·E, or Stable Diffusion with a single click.
      </p>
      <Link href="/signup" className="mt-8 bg-[#E60023] text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md">
        Join Mira Prompts
      </Link>
    </div>

  </div>
</section>
```

## 4. Execution Plan
1. Inject the new Feature Highlight section directly below the Hero section.
2. Style the floating UI chips to closely match Pinterest's interactive, layered aesthetic.
3. Ensure the Footer is still perfectly intact at the bottom of the Landing Page.
4. Verify flawless responsive collapsing for mobile screens.

If you approve this plan, I'll execute it immediately using "caveman ultra" mode!
