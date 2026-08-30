# Implementation Plan: Pinterest-Style Landing Page & Gated Flow

## Objective
To transform the current open-access homepage into a high-converting, Pinterest-style Landing Page for unauthenticated users, while restricting access to the main prompts feed so users are required to sign up or log in to fully explore the platform.

## 1. Architectural Strategy (The Pinterest Flow)
Right now, anyone can view the homepage feed. We will change this logic:
- **Logged-Out Users** visiting `/` will see the new **Landing Page** (Pinterest style).
- **Logged-In Users** visiting `/` will automatically see the **Main Prompts Feed** (your current masonry grid).
- **Gating (`/explore`):** If a logged-out user tries to navigate to `/explore` or click a "Start Exploring" button, they will be redirected to the `/signup` or `/login` page. 

## 2. Landing Page Design (Pinterest Style)
I will build a brand new Landing Page component that perfectly captures the Pinterest aesthetic:
- **Top Bar (Unauth):** Minimalist transparent header containing the Mira logo on the left, and "About", "Log in", and a prominent "Sign up" button on the right.
- **Hero Section:** 
  - A massive, dynamic headline (e.g., "Get your next..." followed by a typing/cycling animation: "Midjourney prompt", "DALL-E masterpiece", "Creative inspiration").
  - A primary Call-to-Action (CTA) button: "Explore Prompts" (which routes them to the signup wall).
- **The Visual Hook (Animated Grid):** 
  - In the background or lower half of the hero, we will fetch a live sample of the best `is_featured` prompts.
  - We will render them in a masonry grid, but apply an auto-scrolling CSS animation (like a slow waterfall) to tease the content.
  - The grid will have a gradient fade at the bottom, creating a "peek" effect that makes the user want to scroll down (which prompts them to sign up).

## 3. Technical Implementation Details

### A. Updating `src/app/(public)/page.tsx`
We will modify the root page to check authentication:
```tsx
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  // Render the new Pinterest-style Landing Page
  return <LandingPage bestPrompts={bestPrompts} />
}

// Render the current logged-in feed
return <main id="home-main">...</main>
```

### B. Creating the `LandingPage` Component
- Build `src/components/home/LandingPage.tsx`.
- Implement a 3-column or 5-column CSS grid that slowly translates upwards using Tailwind `animate-scroll` to simulate Pinterest's dynamic background.
- Overlay the hero text and CTA buttons securely on top using `z-index`.

### C. Gating the App (Middleware or Layout)
- Update `src/app/(public)/explore/page.tsx` (and other core routes if necessary) to enforce authentication. If `!user`, redirect to `/signup?next=/explore`.
- **Note on SEO:** We will keep individual prompt pages (`/prompts/[slug]`) publicly accessible so Googlebot can still index your 224+ sitemap pages and bring in organic search traffic. However, we will add a "Sign up to copy this prompt" CTA on the detail page to capture that SEO traffic.

## 4. Execution Plan
As a Full Stack Developer applying "Tasteskill" (sleek, minimalist, premium UI) and "Ponytail" (clean, non-bloated code):
1. Create the Animated Waterfall Grid using pure CSS/Tailwind (no heavy JS libraries).
2. Build the Landing Page UI with the cycling text ("Get your next...").
3. Wire up the conditional rendering in `page.tsx`.
4. Ensure the signup/login flow seamlessly redirects them back to the feed.

Let me know if you approve this Pinterest-style architecture, and I will begin the implementation immediately!
