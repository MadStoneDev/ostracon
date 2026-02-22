-- ============================================================
-- Phase 3: Database Hardening
-- 3.1 Unique constraints
-- 3.2 Indexes on frequently-queried columns
-- 3.3 Cascade deletes on foreign keys
-- 3.4 Orphaned record cleanup
-- Idempotent: uses IF NOT EXISTS / DROP IF EXISTS
-- ============================================================

-- ===================== 3.1 UNIQUE CONSTRAINTS =====================
-- Prevent duplicate relationships. Uses ADD CONSTRAINT IF NOT EXISTS
-- (Postgres 9.6+ via DO blocks for safety).

-- follows: one follow relationship per pair
ALTER TABLE follows
  DROP CONSTRAINT IF EXISTS follows_unique_pair;
ALTER TABLE follows
  ADD CONSTRAINT follows_unique_pair UNIQUE (follower_id, following_id);

-- fragment_reactions: one reaction per user per type per fragment
ALTER TABLE fragment_reactions
  DROP CONSTRAINT IF EXISTS fragment_reactions_unique_per_user;
ALTER TABLE fragment_reactions
  ADD CONSTRAINT fragment_reactions_unique_per_user UNIQUE (fragment_id, user_id, type);

-- saved_fragments: one save per user per fragment
ALTER TABLE saved_fragments
  DROP CONSTRAINT IF EXISTS saved_fragments_unique_pair;
ALTER TABLE saved_fragments
  ADD CONSTRAINT saved_fragments_unique_pair UNIQUE (user_id, fragment_id);

-- blocked_users: one block per pair
ALTER TABLE blocked_users
  DROP CONSTRAINT IF EXISTS blocked_users_unique_pair;
ALTER TABLE blocked_users
  ADD CONSTRAINT blocked_users_unique_pair UNIQUE (blocker_id, blocked_id);

-- muted_users: one mute per pair
ALTER TABLE muted_users
  DROP CONSTRAINT IF EXISTS muted_users_unique_pair;
ALTER TABLE muted_users
  ADD CONSTRAINT muted_users_unique_pair UNIQUE (muter_id, muted_id);

-- comment_reactions: one reaction per user per type per comment
ALTER TABLE comment_reactions
  DROP CONSTRAINT IF EXISTS comment_reactions_unique_per_user;
ALTER TABLE comment_reactions
  ADD CONSTRAINT comment_reactions_unique_per_user UNIQUE (comment_id, user_id, type);

-- message_reactions: one reaction set per user per message
ALTER TABLE message_reactions
  DROP CONSTRAINT IF EXISTS message_reactions_unique_per_user;
ALTER TABLE message_reactions
  ADD CONSTRAINT message_reactions_unique_per_user UNIQUE (message_id, user_id);

-- muted_conversations: one mute per user per conversation
ALTER TABLE muted_conversations
  DROP CONSTRAINT IF EXISTS muted_conversations_unique_pair;
ALTER TABLE muted_conversations
  ADD CONSTRAINT muted_conversations_unique_pair UNIQUE (user_id, conversation_id);

-- community_members: one membership per user per community
ALTER TABLE community_members
  DROP CONSTRAINT IF EXISTS community_members_unique_pair;
ALTER TABLE community_members
  ADD CONSTRAINT community_members_unique_pair UNIQUE (user_id, community_id);

-- community_join_requests: one request per user per community
ALTER TABLE community_join_requests
  DROP CONSTRAINT IF EXISTS community_join_requests_unique_pair;
ALTER TABLE community_join_requests
  ADD CONSTRAINT community_join_requests_unique_pair UNIQUE (community_id, user_id);

-- conversation_participants: one participant record per user per conversation
ALTER TABLE conversation_participants
  DROP CONSTRAINT IF EXISTS conversation_participants_unique_pair;
ALTER TABLE conversation_participants
  ADD CONSTRAINT conversation_participants_unique_pair UNIQUE (conversation_id, user_id);

-- fragments_tags: one tag per fragment
ALTER TABLE fragments_tags
  DROP CONSTRAINT IF EXISTS fragments_tags_unique_pair;
ALTER TABLE fragments_tags
  ADD CONSTRAINT fragments_tags_unique_pair UNIQUE (fragment_id, tag_id);


-- ===================== 3.2 INDEXES =====================
-- Speed up the most common queries. CREATE INDEX IF NOT EXISTS is safe to re-run.

-- Fragments: feed queries (user timeline, community feed, published ordering)
CREATE INDEX IF NOT EXISTS idx_fragments_user_published
  ON fragments (user_id, published_at DESC)
  WHERE is_draft = false AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_fragments_community_published
  ON fragments (community_id, published_at DESC)
  WHERE is_draft = false AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_fragments_published_at
  ON fragments (published_at DESC)
  WHERE is_draft = false AND deleted_at IS NULL;

-- Fragment comments: comment threads
CREATE INDEX IF NOT EXISTS idx_fragment_comments_fragment_created
  ON fragment_comments (fragment_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fragment_comments_user
  ON fragment_comments (user_id);

-- Fragment reactions: like counts and user-specific lookups
CREATE INDEX IF NOT EXISTS idx_fragment_reactions_fragment_type
  ON fragment_reactions (fragment_id, type);

CREATE INDEX IF NOT EXISTS idx_fragment_reactions_user
  ON fragment_reactions (user_id);

-- Follows: follower/following lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower
  ON follows (follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_following
  ON follows (following_id);

-- Notifications: user notification feed
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read)
  WHERE read = false;

-- Conversations: participant lookups, message ordering
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
  ON conversation_participants (user_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at DESC);

-- Profiles: username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON profiles (username);

-- Saved fragments: user saved feed
CREATE INDEX IF NOT EXISTS idx_saved_fragments_user_created
  ON saved_fragments (user_id, created_at DESC);

-- Blocked/muted users: quick lookup per user
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker
  ON blocked_users (blocker_id);

CREATE INDEX IF NOT EXISTS idx_muted_users_muter
  ON muted_users (muter_id);

-- Community members: community roster, user memberships
CREATE INDEX IF NOT EXISTS idx_community_members_community
  ON community_members (community_id);

CREATE INDEX IF NOT EXISTS idx_community_members_user
  ON community_members (user_id);

-- Moderation: queue lookups by status
CREATE INDEX IF NOT EXISTS idx_fragment_flags_fragment
  ON fragment_flags (fragment_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user
  ON user_reports (reported_user_id);

CREATE INDEX IF NOT EXISTS idx_posts_moderation_status
  ON posts_moderation (status, created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_moderation_status
  ON profiles_moderation (status, created_at);

CREATE INDEX IF NOT EXISTS idx_images_moderation_status
  ON images_moderation (status, created_at);

CREATE INDEX IF NOT EXISTS idx_moderation_history_moderator
  ON moderation_history (moderator_id, created_at DESC);

-- Tags: tag name lookup, usage ordering
CREATE INDEX IF NOT EXISTS idx_tags_tag
  ON tags (tag);

CREATE INDEX IF NOT EXISTS idx_fragments_tags_tag
  ON fragments_tags (tag_id);

-- Profile photos: user gallery ordering
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_order
  ON profile_photos (user_id, display_order);


-- ===================== 3.3 CASCADE DELETES =====================
-- Add ON DELETE CASCADE to foreign keys so child records are cleaned up
-- when parent records are deleted. We drop the existing FK and re-add
-- with CASCADE behavior.
--
-- NOTE: Supabase-managed tables may already have some FKs. We use
-- a DO block to safely drop-and-recreate only if the constraint exists.
-- If the FK doesn't exist yet, we just add it fresh.

-- Helper: function to conditionally drop a constraint
CREATE OR REPLACE FUNCTION _drop_constraint_if_exists(
  _table text, _constraint text
) RETURNS void AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = _table AND constraint_name = _constraint
  ) THEN
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', _table, _constraint);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- --- fragment_comments → fragments (delete comments when post deleted) ---
SELECT _drop_constraint_if_exists('fragment_comments', 'fragment_comments_fragment_id_fkey');
ALTER TABLE fragment_comments
  ADD CONSTRAINT fragment_comments_fragment_id_fkey
  FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE;

-- --- fragment_comments parent self-ref (delete replies when parent deleted) ---
SELECT _drop_constraint_if_exists('fragment_comments', 'fragment_comments_parent_id_fkey');
ALTER TABLE fragment_comments
  ADD CONSTRAINT fragment_comments_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES fragment_comments(id) ON DELETE CASCADE;

-- --- comment_edit_history → fragment_comments ---
SELECT _drop_constraint_if_exists('comment_edit_history', 'comment_edit_history_comment_id_fkey');
ALTER TABLE comment_edit_history
  ADD CONSTRAINT comment_edit_history_comment_id_fkey
  FOREIGN KEY (comment_id) REFERENCES fragment_comments(id) ON DELETE CASCADE;

-- --- fragments_tags → fragments ---
SELECT _drop_constraint_if_exists('fragments_tags', 'fragments_tags_fragment_id_fkey');
ALTER TABLE fragments_tags
  ADD CONSTRAINT fragments_tags_fragment_id_fkey
  FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE;

-- --- fragments_tags → tags ---
SELECT _drop_constraint_if_exists('fragments_tags', 'fragments_tags_tag_id_fkey');
ALTER TABLE fragments_tags
  ADD CONSTRAINT fragments_tags_tag_id_fkey
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;

-- --- fragment_reactions → fragments ---
SELECT _drop_constraint_if_exists('fragment_reactions', 'fragment_reactions_fragment_id_fkey');
ALTER TABLE fragment_reactions
  ADD CONSTRAINT fragment_reactions_fragment_id_fkey
  FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE;

-- --- comment_reactions → fragment_comments ---
SELECT _drop_constraint_if_exists('comment_reactions', 'comment_reactions_comment_id_fkey');
ALTER TABLE comment_reactions
  ADD CONSTRAINT comment_reactions_comment_id_fkey
  FOREIGN KEY (comment_id) REFERENCES fragment_comments(id) ON DELETE CASCADE;

-- --- saved_fragments → fragments ---
SELECT _drop_constraint_if_exists('saved_fragments', 'saved_fragments_fragment_id_fkey');
ALTER TABLE saved_fragments
  ADD CONSTRAINT saved_fragments_fragment_id_fkey
  FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE;

-- --- fragment_flags → fragments ---
SELECT _drop_constraint_if_exists('fragment_flags', 'fragment_flags_fragment_id_fkey');
ALTER TABLE fragment_flags
  ADD CONSTRAINT fragment_flags_fragment_id_fkey
  FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE;

-- --- fragment_flag_resolutions → fragments ---
SELECT _drop_constraint_if_exists('fragment_flag_resolutions', 'fragment_flag_resolutions_fragment_id_fkey');
ALTER TABLE fragment_flag_resolutions
  ADD CONSTRAINT fragment_flag_resolutions_fragment_id_fkey
  FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE CASCADE;

-- --- flag_appeals → fragment_flag_resolutions ---
SELECT _drop_constraint_if_exists('flag_appeals', 'flag_appeals_resolution_id_fkey');
ALTER TABLE flag_appeals
  ADD CONSTRAINT flag_appeals_resolution_id_fkey
  FOREIGN KEY (resolution_id) REFERENCES fragment_flag_resolutions(id) ON DELETE CASCADE;

-- --- report_appeals → user_report_resolutions ---
SELECT _drop_constraint_if_exists('report_appeals', 'report_appeals_resolution_id_fkey');
ALTER TABLE report_appeals
  ADD CONSTRAINT report_appeals_resolution_id_fkey
  FOREIGN KEY (resolution_id) REFERENCES user_report_resolutions(id) ON DELETE CASCADE;

-- --- posts_moderation → fragments ---
SELECT _drop_constraint_if_exists('posts_moderation', 'posts_moderation_post_id_fkey');
ALTER TABLE posts_moderation
  ADD CONSTRAINT posts_moderation_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES fragments(id) ON DELETE CASCADE;

-- --- notifications → fragments (SET NULL since notification still useful) ---
SELECT _drop_constraint_if_exists('notifications', 'notifications_fragment_id_fkey');
ALTER TABLE notifications
  ADD CONSTRAINT notifications_fragment_id_fkey
  FOREIGN KEY (fragment_id) REFERENCES fragments(id) ON DELETE SET NULL;

-- --- notifications → fragment_comments (SET NULL) ---
SELECT _drop_constraint_if_exists('notifications', 'notifications_comment_id_fkey');
ALTER TABLE notifications
  ADD CONSTRAINT notifications_comment_id_fkey
  FOREIGN KEY (comment_id) REFERENCES fragment_comments(id) ON DELETE SET NULL;

-- --- notifications → conversations (SET NULL) ---
SELECT _drop_constraint_if_exists('notifications', 'notifications_conversation_id_fkey');
ALTER TABLE notifications
  ADD CONSTRAINT notifications_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL;

-- --- messages → conversations ---
SELECT _drop_constraint_if_exists('messages', 'messages_conversation_id_fkey');
ALTER TABLE messages
  ADD CONSTRAINT messages_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- --- message_reactions → messages ---
SELECT _drop_constraint_if_exists('message_reactions', 'message_reactions_message_id_fkey');
ALTER TABLE message_reactions
  ADD CONSTRAINT message_reactions_message_id_fkey
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

-- --- conversation_participants → conversations ---
SELECT _drop_constraint_if_exists('conversation_participants', 'conversation_participants_conversation_id_fkey');
ALTER TABLE conversation_participants
  ADD CONSTRAINT conversation_participants_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- --- muted_conversations → conversations ---
SELECT _drop_constraint_if_exists('muted_conversations', 'muted_conversations_conversation_id_fkey');
ALTER TABLE muted_conversations
  ADD CONSTRAINT muted_conversations_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- --- community_members → communities ---
SELECT _drop_constraint_if_exists('community_members', 'community_members_community_id_fkey');
ALTER TABLE community_members
  ADD CONSTRAINT community_members_community_id_fkey
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE;

-- --- community_join_requests → communities ---
SELECT _drop_constraint_if_exists('community_join_requests', 'community_join_requests_community_id_fkey');
ALTER TABLE community_join_requests
  ADD CONSTRAINT community_join_requests_community_id_fkey
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE;

-- --- profile_photos → profiles ---
SELECT _drop_constraint_if_exists('profile_photos', 'profile_photos_user_id_fkey');
ALTER TABLE profile_photos
  ADD CONSTRAINT profile_photos_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- --- subscriptions → profiles ---
SELECT _drop_constraint_if_exists('subscriptions', 'subscriptions_profile_id_fkey');
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- --- subscriptions → subscription_packages ---
SELECT _drop_constraint_if_exists('subscriptions', 'subscriptions_package_id_fkey');
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_package_id_fkey
  FOREIGN KEY (package_id) REFERENCES subscription_packages(id) ON DELETE CASCADE;

-- Clean up helper function
DROP FUNCTION IF EXISTS _drop_constraint_if_exists(text, text);


-- ===================== 3.4 ORPHANED RECORD CLEANUP =====================
-- Delete any orphaned records that reference non-existent parent rows.
-- Run once to clean up existing data; the CASCADE FKs above prevent future orphans.

-- Orphaned comments (fragment deleted but comments remain)
DELETE FROM fragment_comments
WHERE fragment_id NOT IN (SELECT id FROM fragments);

-- Orphaned reactions (fragment deleted)
DELETE FROM fragment_reactions
WHERE fragment_id NOT IN (SELECT id FROM fragments);

-- Orphaned comment reactions (comment deleted)
DELETE FROM comment_reactions
WHERE comment_id NOT IN (SELECT id FROM fragment_comments);

-- Orphaned comment edit history (comment deleted)
DELETE FROM comment_edit_history
WHERE comment_id NOT IN (SELECT id FROM fragment_comments);

-- Orphaned fragment tags (fragment or tag deleted)
DELETE FROM fragments_tags
WHERE fragment_id NOT IN (SELECT id FROM fragments);
DELETE FROM fragments_tags
WHERE tag_id NOT IN (SELECT id FROM tags);

-- Orphaned saved fragments (fragment deleted)
DELETE FROM saved_fragments
WHERE fragment_id NOT IN (SELECT id FROM fragments);

-- Orphaned fragment flags (fragment deleted)
DELETE FROM fragment_flags
WHERE fragment_id NOT IN (SELECT id FROM fragments);

-- Orphaned notifications (referenced fragment/comment/conversation deleted)
DELETE FROM notifications
WHERE fragment_id IS NOT NULL
  AND fragment_id NOT IN (SELECT id FROM fragments);

DELETE FROM notifications
WHERE comment_id IS NOT NULL
  AND comment_id NOT IN (SELECT id FROM fragment_comments);

DELETE FROM notifications
WHERE conversation_id IS NOT NULL
  AND conversation_id NOT IN (SELECT id FROM conversations);

-- Orphaned messages (conversation deleted)
DELETE FROM messages
WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- Orphaned conversation participants (conversation deleted)
DELETE FROM conversation_participants
WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- Orphaned community members (community deleted)
DELETE FROM community_members
WHERE community_id NOT IN (SELECT id FROM communities);

-- Orphaned community join requests (community deleted)
DELETE FROM community_join_requests
WHERE community_id NOT IN (SELECT id FROM communities);

-- Orphaned posts moderation (fragment deleted)
DELETE FROM posts_moderation
WHERE post_id NOT IN (SELECT id FROM fragments);

-- Orphaned profile photos (user deleted)
DELETE FROM profile_photos
WHERE user_id NOT IN (SELECT id FROM profiles);
