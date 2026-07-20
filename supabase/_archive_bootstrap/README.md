# Archived bootstrap bundles — DO NOT re-run against a live database

These two files (`combined_005_to_010.sql`, `run_missing_migrations.sql`) were
convenience bundles for manually catching up an early database. They were moved
out of `supabase/migrations/` on 2026-07-19 because re-running them is dangerous:

- They redefine `handle_new_user()` with an **older, non-invite-aware** version.
  Re-running after migration 061/064 silently reverts invited-user signup so new
  members get a personal org instead of joining the org that invited them — no
  error is raised.
- They `CREATE OR REPLACE VIEW plan_limits` with the **old 10-column shape**.
  After migrations 037/039/058 grew and renamed columns, re-running aborts with
  `cannot change name of view column` / `cannot drop columns from view`.

They are kept only for historical reference. The canonical schema is the numbered
migrations in `supabase/migrations/`. Never add these back to that directory.
