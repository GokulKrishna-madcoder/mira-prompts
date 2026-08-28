# Dashboard Refinement & Redesign Implementation Plan

## 1. Desktop Logo Relocation
Currently, the Mira logo sits inside the `DashboardSidebar` on desktop, which breaks the conventional top-left placement.
- **Action**: Remove the desktop logo from `DashboardSidebar.tsx`.
- **Action**: Add a `showDesktopLogo?: boolean` prop to the shared `TopBar.tsx` component. 
- **Action**: Update `src/app/(dashboard)/layout.tsx` to pass `showDesktopLogo={true}`. This ensures the full Mira Logo (`/brand/logo.png`) appears cleanly in the TopBar on dashboard pages, without accidentally doubling-up the logo on public pages (where the mini-sidebar already holds the logo).

## 2. Hide Sidebar Scrollbar
The visible scrollbar in the sidebar breaks the clean aesthetic.
- **Action**: Inject scrollbar-hiding CSS utilities (`[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`) into the `<aside>` container in `DashboardSidebar.tsx` for a perfectly sleek, scrollable panel.

## 3. "Tasteskill" Dashboard Overview Redesign
The current `/dashboard` page uses heavy maroon solid colors and dark gradients that clash with Mira's stark, minimalist, and premium (black/white/brand-red) design system.
- **Action**: Redesign `src/app/(dashboard)/dashboard/page.tsx` using Tasteskill principles.
- **Colors**: Strip out the heavy `bg-[#B91C1C]` and `bg-gradient-to-br` cards. Move to a highly premium `bg-white` card system with crisp `border-gray-200` borders and subtle shadows.
- **Typography & Accents**: Use stark black for primary metrics, soft `text-gray-500` for labels, and restrict the brand red (`#E11D48`) strictly to icons, active states, and specific accent highlights to make them pop.
- **Layout Adjustments**: Refine card padding, border radii (standardize to `rounded-2xl` or `3xl` to match the site), and ensure the grid feels breathable, structured, and strictly adheres to the site's existing UI components.

Please approve this plan, and I will execute it using Caveman Ultra and Tasteskill modes.
