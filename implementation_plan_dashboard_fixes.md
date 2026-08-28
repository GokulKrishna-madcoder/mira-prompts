# Dashboard Refinement Implementation Plan

Based on your feedback, we need to adjust the layout structure so that the Dashboard seamlessly integrates with the rest of the website's universal components, particularly the main Topbar and the unified Avatar system.

## 1. Unified Main TopBar Integration
The current implementation introduced a separate `DashboardTopBar`. We will remove this and instead mount the main website `TopBar` globally above the Dashboard.
- **Layout Restructure**: Modify `src/app/(dashboard)/layout.tsx`. The layout will stack vertically: 
  - `TopBar` (Full width across the top)
  - A flex container below holding the `DashboardSidebar` (left) and the main scrollable `children` content area (right).
- **Result**: The main search bar, feedback button, and the fully functional `NotificationsPopover` will be preserved across all dashboard pages, fixing the broken notification button.

## 2. Universal Profile Avatar Approach
We need to ensure that across the entire website (TopBar, DashboardSidebar, etc.), if a user has not uploaded a custom profile image (`avatar_url` is null), we fall back to the old gradient circle with their initial.
- Extract the `getAvatarGradient` logic from `TopBar.tsx` into a reusable helper function or directly into the `UserDropdown` and `DashboardSidebar` components.
- **DashboardSidebar Update**: Replace the dark `#4A3A3B` static circle placeholder with the dynamic `gradientClass` approach. If `avatar_url` exists, display it; otherwise, display the gradient initial circle.
- **ProfileModal Update**: The image preview circle in the Profile Modal will also use the gradient circle approach as the fallback instead of the generic grey `UserIcon`.

## 3. Removal of Redundant Components
- Delete `src/components/dashboard/DashboardTopBar.tsx` as it is no longer needed.

## Execution
This approach directly fulfills your requirements, guaranteeing that the robust main TopBar and its notification functionality are restored to the dashboard, and ensuring avatar consistency sitewide.

Please approve this plan to begin implementation using Ponytail and Caveman Ultra mode.
