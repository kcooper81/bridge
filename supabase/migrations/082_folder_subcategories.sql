-- 082: Sub-categories for the Shared Prompt Library
-- Allows folders (a.k.a. categories) to nest one level deep.
-- A trigger enforces depth <= 2 and prevents self-parenting / cross-org parents / cycles.

ALTER TABLE folders
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(org_id, parent_id);

CREATE OR REPLACE FUNCTION enforce_folder_depth()
RETURNS TRIGGER AS $$
DECLARE
  parent_org UUID;
  parent_parent UUID;
  child_count INT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.parent_id = NEW.id THEN
    RAISE EXCEPTION 'A category cannot be its own parent';
  END IF;

  SELECT org_id, parent_id INTO parent_org, parent_parent
  FROM folders WHERE id = NEW.parent_id;

  IF parent_org IS NULL THEN
    RAISE EXCEPTION 'Parent category does not exist';
  END IF;

  IF parent_org <> NEW.org_id THEN
    RAISE EXCEPTION 'Parent category must belong to the same organization';
  END IF;

  IF parent_parent IS NOT NULL THEN
    RAISE EXCEPTION 'Sub-categories cannot be nested more than one level deep';
  END IF;

  SELECT COUNT(*) INTO child_count FROM folders WHERE parent_id = NEW.id;
  IF child_count > 0 THEN
    RAISE EXCEPTION 'Cannot demote a category that already has sub-categories';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS folders_enforce_depth ON folders;
CREATE TRIGGER folders_enforce_depth
  BEFORE INSERT OR UPDATE OF parent_id ON folders
  FOR EACH ROW EXECUTE FUNCTION enforce_folder_depth();
