-- Shared testing guide state for super admins
-- Stores pass/fail/skip status and notes, visible to all admins with testing guide access

create table if not exists testing_guide_state (
  step_key text not null,
  status text not null default 'untested' check (status in ('untested', 'pass', 'fail', 'skip')),
  note text not null default '',
  updated_by uuid references auth.users(id),
  updated_by_email text,
  updated_at timestamptz not null default now(),
  primary key (step_key)
);

-- Index for quick lookups
create index if not exists idx_testing_guide_updated on testing_guide_state(updated_at desc);

-- RLS: only super admins and staff can read/write
alter table testing_guide_state enable row level security;

create policy "Super admins can read testing guide"
  on testing_guide_state for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_super_admin = true
    )
  );

create policy "Super admins can insert testing guide"
  on testing_guide_state for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_super_admin = true
    )
  );

create policy "Super admins can update testing guide"
  on testing_guide_state for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_super_admin = true
    )
  );

create policy "Super admins can delete testing guide"
  on testing_guide_state for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_super_admin = true
    )
  );
