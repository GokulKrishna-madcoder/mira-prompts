# Fix Dashboard Layout Gap & Navigation

## Problem Analysis
1. **White Space Gap on Mobile**: The `DashboardSidebar` has `sticky` and `fixed` classes simultaneously (`sticky top-0 ... fixed`). In Tailwind, `sticky` overrides `fixed` depending on class order in the generated CSS, causing the sidebar to stay in the document flow (taking up 280px of width) even though it is translated off-screen `-translate-x-full`.
2. **Missing Home Navigation**: Because the standard Desktop `Sidebar` (which houses the site logo) is replaced by `DashboardSidebar` on dashboard routes, desktop users have no logo to click to go Home. 

## Implementation Plan

1. **Fix Mobile Gap (CSS Position Conflict)**:
   - Modify `DashboardSidebar.tsx` classes.
   - Remove the global `sticky` class.
   - Use `fixed` for mobile (out of flow) and `md:sticky` for desktop (in flow).
   - This ensures the sidebar takes 0px of layout width on mobile.

2. **Add Home Navigation**:
   - Add the Mira Logo (`/brand/logo.png`) to the very top of `DashboardSidebar` (visible on desktop) so users can click it to return to the public home page.
   - Add a "Home" link (using the `Home` Lucide icon) to the top of the `navGroups` array inside `DashboardSidebar` as an explicit navigation option.

I will use Caveman Ultra to apply these fixes instantly.
