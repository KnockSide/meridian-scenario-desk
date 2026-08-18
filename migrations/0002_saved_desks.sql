create table if not exists saved_desks (
  id             serial primary key,
  user_id        text not null,
  name           text not null,
  active         jsonb not null,
  weights        jsonb not null,
  horizon_months int not null default 12,
  created_at     timestamptz not null default now()
);
create index if not exists saved_desks_user_id_idx on saved_desks (user_id);
