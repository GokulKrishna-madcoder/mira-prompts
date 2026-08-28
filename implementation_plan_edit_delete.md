# Implementation Plan: Edit and Delete User Prompts

## 1. Delete Functionality
**Action & API:**
- Create a new Server Action `deletePrompt(promptId: string)` in `src/lib/user-actions.ts`.
- The action will verify that the prompt belongs to the authenticated user (i.e. `created_by === user.id`).
- If verified, it will delete the prompt from Supabase and call `revalidatePath('/posts')`.

**UI Integration:**
- In `src/app/(dashboard)/posts/page.tsx`, add a context menu (three dots) or inline buttons on the prompt cards to allow users to Delete.
- Create a `PostActions.tsx` Client Component that receives `promptId` and handles the confirmation dialog (e.g. `window.confirm("Are you sure?")`) before triggering the `deletePrompt` Server Action.

## 2. Edit Functionality
**Routing:**
- Create a new page: `src/app/(dashboard)/posts/[id]/edit/page.tsx` (or `(public)` if we want to mimic the `submit-prompt` layout).
- This page will fetch the user's prompt (verifying ownership) and render the `SubmitPromptForm`.

**Form Updates (`SubmitPromptForm.tsx`):**
- Update the `SubmitPromptForm` component to accept an optional `initialData` prop containing the prompt details (title, tags, images, variants, category).
- Pre-fill state variables (`title`, `selectedTools`, `tags`, `variantType`, `variants`) if `initialData` is present.
- In `handleSubmit`, detect if it is an edit (`initialData.id` exists). If so, call an `updatePrompt` Server Action instead of `submitPrompt`.

**Server Action (`updatePrompt`):**
- Create `updatePrompt(promptId: string, formData: FormData)` in `src/lib/user-actions.ts`.
- It will validate the input just like `submitPrompt`, verify ownership, upload any *new* images provided, and perform an `UPDATE` on the `prompts` table rather than an `INSERT`.

**UI Integration:**
- In the `PostActions.tsx` Client Component on the `/posts` page, add an "Edit" link pointing to `/posts/[id]/edit`.

I can implement this using Caveman Ultra.
