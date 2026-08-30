# Implementation Plan: Mobile Nav & Profile Modal Polish

## 1. Add `+` (Create) Button to Mobile Nav
Currently, the mobile bottom navigation bar (`MobileNav.tsx`) is missing the shortcut to submit a new prompt, which exists on the desktop sidebar.
**Fix:**
I will add a `MobileNavIcon` for the `/submit-prompt` route right in the center of the mobile navigation bar, using the `Plus` icon from `lucide-react`, matching the desktop layout. 

**[MODIFY] `src/components/layout/MobileNav.tsx`**
- Import `Plus` from `lucide-react`
- Insert `<MobileNavIcon href="/submit-prompt" icon={<Plus className="w-6 h-6" />} label="Create" active={pathname === '/submit-prompt'} />` between the `Explore` and `Saved` icons.

## 2. Hide Scrollbar in Profile Modal
When you open `/dashboard?modal=profile`, the internal scrolling `div` shows an ugly native scrollbar which breaks the sleek, minimalist "tasteskill" aesthetic.
**Fix:**
I will apply Tailwind's scrollbar-hiding utilities to the main scrolling container of the `ProfileModal`.

**[MODIFY] `src/components/dashboard/ProfileModal.tsx`**
- Locate the wrapper: `<div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">`
- Append the "hide scrollbar" classes: `[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`

## Execution
Since these are purely cosmetic CSS and layout adjustments, I can execute them immediately using the Ponytail fast-track. Let me know if you approve this plan or want me to execute it immediately.
