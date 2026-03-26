-- Add verification badge support
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_verified
  ON profiles (is_verified)
  WHERE is_verified = true;
