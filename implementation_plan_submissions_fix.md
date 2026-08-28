# Implementation Plan: Fix Admin Submissions Page

## Root Cause
The `AdminSubmissionsPage` was rendering `0 pending review` despite there being pending prompts in the database. 

The bug wasn't an RLS issue or caching issue, but rather a **silent query failure**. The page was attempting to query:
```javascript
.select('..., profiles:created_by(display_name, email)')
```
However, the `profiles` table in the database **does not have an `email` column** (emails are stored in `auth.users`). Because the query requested a non-existent column, Supabase threw an error and returned `null` for the data. Since the frontend didn't log the error and just checked `prompts?.length || 0`, it failed silently and showed 0 prompts.

## Proposed Fix
1. Modify `src/app/admin/submissions/page.tsx` to remove `email` from the select statement.
2. Replace it with `username` (which *does* exist in `profiles` thanks to our recent user profiles expansion migration).
3. Update the UI fallback logic from `profile?.display_name || profile?.email || 'Unknown'` to `profile?.display_name || profile?.username || 'Unknown'`.

This allows the Supabase query to successfully execute and fetch all pending prompts to be reviewed.
