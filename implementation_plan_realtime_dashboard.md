# Implementation Plan: Real-time Data & Topbar Refinements

## 1. Topbar & Profile Updates
- **Logo Size**: In `src/components/layout/TopBar.tsx`, reduce the Desktop Logo dimensions to `w={80} h={28}` (down from 100x36).
- **Avatar Integration**: Update `TopBar.tsx` to pass the user's `avatar_url` into the `UserDropdown` component. Inside `UserDropdown.tsx`, render the actual `Image` if the URL exists, falling back to the gradient initial.
- **Profile Modal Redirection**: In `src/components/layout/UserDropdown.tsx`, change the "Profile" link from `/profile` to `?modal=profile` so it correctly triggers the new modal instead of attempting a full page navigation.

## 2. Dashboard Overview (`src/app/(dashboard)/dashboard/page.tsx`)
- **Saved Boards**: Fetch actual real-time user saves from the `prompt_saves` table joined with the `prompts` table. Render the top 3 latest saved prompts dynamically in the "Saved Boards" card, replacing the hardcoded empty state.
- **Content Mix Circular Ring fix**: Add the `shrink-0 aspect-square` classes to the `w-28 h-28` circle element to prevent flexbox from squishing it into an oval shape on smaller screens.
- **Real-time Accuracy**: Ensure `totalSaves`, `totalLikes`, etc. reflect the exact counts calculated on page load. (Note: standard Next.js SSR means data is fresh on every navigation into the dashboard).

## 3. Sidebar Additions (Public Layout)
- **Settings to Preferences**: In `src/components/layout/Sidebar.tsx` (the public layout sidebar), update the bottom "Settings" link/popover to point to `/preferences` and rename its display label to "Preferences".
- **Submit Plus Button**: Add a new explicit `+` (Plus) or "Create" button into the primary navigation items of `Sidebar.tsx` pointing to `/submit-prompt`.

## 4. Notifications (`src/app/(dashboard)/notifications/page.tsx`)
- The user's system relies on the `prompts` table (`is_featured=true` or `is_premium=true`) acting as notifications. 
- Implement real server-side fetching of these notifications inside the `/notifications` page, mirroring the logic used in `NotificationsPopover.tsx`.

I will use Caveman Ultra & Tasteskill modes to implement all of this.
