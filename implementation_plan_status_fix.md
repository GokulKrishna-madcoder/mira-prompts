# Implementation Plan: Fix "prompts_status_check" Constraint

## Root Cause
When users submit a prompt for review, the frontend sets the status to `'pending'` (via `submitPrompt` action). However, the `prompts` table in the PostgreSQL database was created with a check constraint (`prompts_status_check`) that only permits `('draft', 'published', 'archived')`. Since `'pending'` is not in the allowed list, the database rejects the insert/update, causing a 500 Server Error.

## Proposed Fix
We will write a new Supabase migration to modify the database schema so that `'pending'` (and `'rejected'` for future safety) is permitted. 

### Steps:
1. **Create Database Migration:**
   Create a new migration file: `supabase/migrations/20240829000001_add_pending_status.sql`.
2. **Update Constraint:**
   ```sql
   -- Drop the old strict constraint
   ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_status_check;

   -- Add the new constraint with 'pending' and 'rejected' included
   ALTER TABLE prompts ADD CONSTRAINT prompts_status_check 
   CHECK (status IN ('draft', 'pending', 'published', 'archived', 'rejected'));
   ```
3. **Apply & Verify:**
   Run `npx supabase db push` (or `npx supabase db reset` if developing locally) to apply the migration, which will instantly fix the submission error without breaking any existing data. 
