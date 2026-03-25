-- Automatically maintain communities.member_count via triggers
-- Replaces error-prone client-side increment/decrement

CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET member_count = COALESCE(member_count, 0) + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET member_count = GREATEST(COALESCE(member_count, 0) - 1, 0)
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_member_count_on_insert ON community_members;
CREATE TRIGGER trigger_update_member_count_on_insert
  AFTER INSERT ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

DROP TRIGGER IF EXISTS trigger_update_member_count_on_delete ON community_members;
CREATE TRIGGER trigger_update_member_count_on_delete
  AFTER DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- Sync existing counts to be accurate
UPDATE communities c
SET member_count = (
  SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id
);
