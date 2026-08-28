# Implementation Plan: Dropdown Links & Dashboard CTA Redesign

## 1. Topbar Dropdown Navigation Updates
Currently, the `UserDropdown` lacks a direct link to the main User Dashboard, and only shows the Admin Dashboard to admins.
- **Action**: Add a new "Dashboard" link (pointing to `/dashboard` with a `LayoutDashboard` icon) visible to all users.
- **Action**: For admins, they will now see both "Dashboard" and "Admin Dashboard" (`/admin`). I will update the Admin Dashboard icon to a `Shield` to visually distinguish it from the user dashboard.

## 2. Dashboard Overview: Actionable CTA Replacement
The current "Everything's free" card is redundant for active creators. We will replace it with an actionable CTA that directly encourages and educates users on the core "Website Prompt flow" (creating versatile prompts with variants).
- **New Title**: "Become a Top Creator" (with a `Sparkles` or `Zap` icon).
- **New Copy**: "Boost your engagement by adding multiple variants (like Gender or Creative Ads) to your prompts. High-quality submissions are more likely to get featured!"
- **Action Button**: "Submit a masterpiece" (linking to `/submit-prompt`).
- **Visuals**: Keep the premium dark card styling and subtle red blur, as it perfectly balances the stark white design of the rest of the page.

I will implement this using Caveman Ultra immediately.
