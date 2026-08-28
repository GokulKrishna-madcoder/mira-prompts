# Dashboard Redesign Implementation Plan

This plan outlines the implementation of the new unified User Dashboard, moving away from fragmented pages to a cohesive app-like experience as shown in the reference design.

## 1. Database Schema Updates
We need to expand the `profiles` table to store the new data required by the design.
- Create Supabase migration `20240829000000_user_profiles_expansion.sql`
- Add `username` (TEXT, UNIQUE)
- Add `social_links` (JSONB) to store Instagram, Youtube, Facebook, X, Pinterest.
- Add `preferences` (JSONB) to store toggles (Email notification, Browser Notification, Prompt picks email, Haptic Feedback, Analytics).

## 2. Shared Dashboard Layout (`/src/app/(dashboard)`)
We will create a new route group `(dashboard)` to provide a shared sidebar layout.
- **Sidebar Component (`DashboardSidebar.tsx`)**:
  - **Header**: User Avatar, Name, Email, "Edit Profile" button (opens Profile Modal).
  - **Content Group**: Overview (`/dashboard`), My Posts (`/my-prompts`), Add Post (`/submit-prompt`), Saved Posts (`/saved`). (Skipping Collections per request).
  - **Audience Group**: Notifications (`/notifications`). (Skipping Network per request).
  - **Account Group**: Profile (Triggers Modal), Security (`/security`), Preferences (`/preferences`).
- The layout will replace the standard container for these specific routes, creating a 2-column view (Sidebar + Main Content).

## 3. Overview Page (`/dashboard/page.tsx`)
Build the main dashboard view mimicking the screenshot:
- **Top Stats Cards**: Total Prompts (Red background), Impressions (Total views), Saves (Times bookmarked).
- **Middle Row**:
  - **Engagement Card**: Dark gradient card showing Total copies, saves, likes, views across all prompts.
  - **Recent Prompts**: A mini-list of the user's 3 most recent prompts (or "No prompts yet" empty state).
- **Bottom Row**:
  - **Saved Boards**: A preview of the most recently saved prompts.
  - **Content Mix**: A visual donut chart (or simple CSS circle) showing the ratio of Published vs. Drafts.
  - **Promo Card**: "Everything's free" dark gradient card.

## 4. Move & Adapt Existing Pages
Move the following existing pages into the `(dashboard)` layout so they gain the sidebar:
- Move `/my-prompts` -> `(dashboard)/my-prompts/page.tsx`
- Move `/saved` -> `(dashboard)/saved/page.tsx`
- Move `/submit-prompt` -> `(dashboard)/submit-prompt/page.tsx`
*(Note: They will still have the same URLs, but will now render inside the dashboard sidebar).*

## 5. New Settings Sections
- **Profile Modal**: Create a highly polished modal containing form fields for: Profile Image upload, Display Name, Username, Email (readonly), Bio, and the 5 Social Links.
- **Security Page (`/security`)**: Change password form (Current, New, Confirm) and the Danger Zone (Sign out, Delete Account).
- **Preferences Page (`/preferences`)**: Toggle switches for the requested settings using a clean, modern UI, plus a "Save Preferences" button.

## User Review Required
- Is keeping the URLs `/my-prompts` and `/saved` fine, or do you want them strictly moved to `/dashboard/posts` and `/dashboard/saved`?
- Should the "Profile" sidebar link open the modal directly, or navigate to a page that opens the modal? (Direct modal trigger is smoother).

Please approve this plan to begin implementation.
