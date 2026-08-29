# Implementation Plan: Fix Creator Profile Visibility

## Root Cause
The reason you're seeing "ChatGPT" instead of the user's Display Name is because of a **Row Level Security (RLS) Policy restriction** on the `profiles` table in your remote database.

Currently, the database is restricting `SELECT` queries on the `profiles` table so that users can only fetch *their own* profile. 
- When you view a prompt *you* uploaded, the database allows it and returns your profile (so your avatar and name show up).
- When you view a prompt *another user* uploaded, the database blocks the fetch for their profile for security reasons. It returns `null`, causing the frontend to fall back to the AI Tool name ("ChatGPT") and a generic avatar.

## Proposed Fix
Since this is a public prompt library where creators get credited for their work, their public profile information (Display Name, Username, Avatar) needs to be publicly readable.

1. **Create a Database Migration:**
   I will write a new SQL migration file to enforce a public `SELECT` policy on the `profiles` table.
   ```sql
   -- Drop the restrictive select policy if it exists
   DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
   DROP POLICY IF EXISTS "Users can view their own profile." ON profiles;
   
   -- Re-create the correct policy to allow anyone to read profiles
   CREATE POLICY "Public profiles are viewable by everyone." 
   ON profiles FOR SELECT 
   USING (true);
   ```

2. **Execute the Fix:**
   I will run a quick server-side script to apply this SQL directly to your remote database (since you're managing remote schemas). This will instantly fix the live site without needing a full redeploy, and the Next.js cache will pick it up.

3. **Commit the Migration:**
   I will commit the `.sql` migration file to the `supabase/migrations/` folder to keep your git repository in sync with the database schema changes.

## Impact
Once applied, the `PromptDetail` page will successfully fetch the creator's profile data regardless of who uploaded it, and the beautiful avatars and display names will instantly populate across all prompts in the Explore feed and Popups.
