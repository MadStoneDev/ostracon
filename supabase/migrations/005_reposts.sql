-- Repost/share functionality
CREATE TABLE IF NOT EXISTS reposts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_fragment_id uuid NOT NULL REFERENCES fragments(id) ON DELETE CASCADE,
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, original_fragment_id)
);

CREATE INDEX IF NOT EXISTS idx_reposts_user ON reposts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reposts_fragment ON reposts (original_fragment_id);

-- RLS
ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reposts"
  ON reposts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reposts"
  ON reposts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reposts"
  ON reposts FOR DELETE USING (auth.uid() = user_id);
