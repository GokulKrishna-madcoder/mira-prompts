ALTER TABLE prompts ADD COLUMN has_variants boolean DEFAULT false; ALTER TABLE prompts ADD COLUMN variants jsonb DEFAULT '[]'::jsonb;
