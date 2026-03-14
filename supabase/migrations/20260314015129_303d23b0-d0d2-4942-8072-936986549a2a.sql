
-- Journal entries table
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Journal attachments table
CREATE TABLE public.journal_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  size integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their entry attachments" ON public.journal_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_attachments.entry_id AND journal_entries.user_id = auth.uid())
);
CREATE POLICY "Users can create attachments for their entries" ON public.journal_attachments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_attachments.entry_id AND journal_entries.user_id = auth.uid())
);
CREATE POLICY "Users can delete their entry attachments" ON public.journal_attachments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.journal_entries WHERE journal_entries.id = journal_attachments.entry_id AND journal_entries.user_id = auth.uid())
);

-- Storage bucket for journal attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('journal-attachments', 'journal-attachments', true);

-- Storage RLS policies
CREATE POLICY "Users can upload journal attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'journal-attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view journal attachments" ON storage.objects FOR SELECT USING (bucket_id = 'journal-attachments');
CREATE POLICY "Users can delete their journal attachments" ON storage.objects FOR DELETE USING (bucket_id = 'journal-attachments' AND auth.uid() IS NOT NULL);
