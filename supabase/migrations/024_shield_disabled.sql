-- Fix: this migration was broken (contained just "did")
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shield_disabled BOOLEAN NOT NULL DEFAULT false;
