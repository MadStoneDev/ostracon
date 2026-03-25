-- Migration: Replace Paddle payment fields with Stripe
-- This migration replaces all Paddle-specific columns with Stripe equivalents

-- 1. profiles: replace paddle_customer_id with stripe_customer_id
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles DROP COLUMN IF EXISTS paddle_customer_id;

-- 2. subscription_packages: replace paddle_price_id with stripe_price_id
ALTER TABLE subscription_packages ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE subscription_packages DROP COLUMN IF EXISTS paddle_price_id;

-- 3. subscriptions: replace paddle fields with stripe fields
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_checkout_id text;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS paddle_subscription_id;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS paddle_checkout_id;

-- 4. Add indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub
  ON subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON subscriptions (profile_id, status);

-- 5. RLS policies for subscriptions (ensure users can read their own)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscriptions'
  ) THEN
    CREATE POLICY "Users can view own subscriptions"
      ON subscriptions FOR SELECT
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscription_packages' AND policyname = 'Anyone can view active packages'
  ) THEN
    CREATE POLICY "Anyone can view active packages"
      ON subscription_packages FOR SELECT
      USING (is_active = true);
  END IF;
END $$;
