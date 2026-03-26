-- Post themes with themed reaction sets
CREATE TABLE IF NOT EXISTS post_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  emoji_set jsonb NOT NULL DEFAULT '[]'::jsonb,
  color text,
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0
);

-- Add theme reference to fragments
ALTER TABLE fragments ADD COLUMN IF NOT EXISTS theme_id uuid REFERENCES post_themes(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE post_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active themes"
  ON post_themes FOR SELECT USING (is_active = true);

-- Seed default themes
INSERT INTO post_themes (name, display_name, emoji_set, color, display_order) VALUES
  ('general', 'General', '[{"emoji": "\u2764\uFE0F", "label": "Like", "type": "like"}]', null, 0),
  ('vent', 'Vent', '[{"emoji": "\uD83E\uDD17", "label": "Hug", "type": "hug"}, {"emoji": "\uD83D\uDE14", "label": "Feel you", "type": "feel-you"}, {"emoji": "\uD83D\uDCAA", "label": "Stay strong", "type": "stay-strong"}, {"emoji": "\u2764\uFE0F", "label": "Love", "type": "love"}]', '#8B5CF6', 1),
  ('creative', 'Creative', '[{"emoji": "\uD83D\uDD25", "label": "Fire", "type": "fire"}, {"emoji": "\uD83D\uDC4F", "label": "Clap", "type": "clap"}, {"emoji": "\u2764\uFE0F", "label": "Love", "type": "love"}, {"emoji": "\u2728", "label": "Inspire", "type": "inspire"}]', '#F59E0B', 2),
  ('discussion', 'Discussion', '[{"emoji": "\uD83D\uDC4D", "label": "Agree", "type": "agree"}, {"emoji": "\uD83D\uDC4E", "label": "Disagree", "type": "disagree"}, {"emoji": "\uD83E\uDD14", "label": "Thinking", "type": "thinking"}, {"emoji": "\uD83D\uDCA1", "label": "Insightful", "type": "insightful"}]', '#3B82F6', 3)
ON CONFLICT (name) DO NOTHING;
