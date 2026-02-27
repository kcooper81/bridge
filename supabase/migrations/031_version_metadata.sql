-- Add changed_by column to prompt_versions for tracking who made each change
ALTER TABLE prompt_versions ADD COLUMN changed_by UUID REFERENCES profiles(id);
