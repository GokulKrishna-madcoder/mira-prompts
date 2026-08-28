-- Drop the old strict constraint
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_status_check;

-- Add the new constraint with 'pending' and 'rejected' included
ALTER TABLE prompts ADD CONSTRAINT prompts_status_check 
CHECK (status IN ('draft', 'pending', 'published', 'archived', 'rejected'));
