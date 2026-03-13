
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS shader_colors jsonb NOT NULL DEFAULT '["#0000ff","#ff00ff","#ffffff"]'::jsonb,
  ADD COLUMN IF NOT EXISTS model_settings jsonb NOT NULL DEFAULT '{"model":"gpt-4","temperature":0.7,"maxTokens":2048,"topP":1.0}'::jsonb;
