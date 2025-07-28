create table settings (
  id serial primary key,
  key text not null unique,
  value jsonb
);

alter table settings enable row level security;

create policy "Admin can manage settings" on settings for all using (auth.role() = 'service_role');
