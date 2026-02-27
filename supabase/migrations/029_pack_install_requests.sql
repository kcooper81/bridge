-- Pack install requests: members request, admins/managers approve
create table if not exists pack_install_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  pack_id text not null,
  pack_type text not null check (pack_type in ('builtin', 'custom')),
  requested_by uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz default now(),
  reviewed_at timestamptz
);

alter table pack_install_requests enable row level security;

-- Members can see their own requests; admins/managers can see all for their org
create policy "Users can view own org requests"
  on pack_install_requests for select
  using (
    org_id in (
      select org_id from profiles where id = auth.uid()
    )
  );

create policy "Users can insert own requests"
  on pack_install_requests for insert
  with check (
    requested_by = auth.uid()
    and org_id in (
      select org_id from profiles where id = auth.uid()
    )
  );

create policy "Admins can update requests"
  on pack_install_requests for update
  using (
    org_id in (
      select org_id from profiles
      where id = auth.uid()
        and role in ('admin', 'manager')
    )
  );
