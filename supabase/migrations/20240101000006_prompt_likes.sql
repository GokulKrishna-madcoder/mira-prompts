-- Add like_count to prompts
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

-- Create prompt_likes table
CREATE TABLE IF NOT EXISTS public.prompt_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prompt_id, user_id)
);

-- RLS
ALTER TABLE public.prompt_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see all likes" ON public.prompt_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.prompt_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.prompt_likes FOR DELETE USING (auth.uid() = user_id);

-- Triggers for counting
CREATE OR REPLACE FUNCTION public.increment_prompt_like()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.prompts SET like_count = like_count + 1 WHERE id = NEW.prompt_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_prompt_like_inserted
  AFTER INSERT ON public.prompt_likes
  FOR EACH ROW EXECUTE PROCEDURE public.increment_prompt_like();

CREATE OR REPLACE FUNCTION public.decrement_prompt_like()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.prompts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.prompt_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_prompt_like_deleted
  AFTER DELETE ON public.prompt_likes
  FOR EACH ROW EXECUTE PROCEDURE public.decrement_prompt_like();
