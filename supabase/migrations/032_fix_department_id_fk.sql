-- Fix: prompts.department_id references departments(id) but the extension
-- sends team UUIDs. Change the FK to reference teams(id) instead.

-- Drop the old FK constraint referencing departments
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_department_id_fkey;

-- Add new FK constraint referencing teams
ALTER TABLE prompts
  ADD CONSTRAINT prompts_department_id_fkey
  FOREIGN KEY (department_id) REFERENCES teams(id) ON DELETE SET NULL;
