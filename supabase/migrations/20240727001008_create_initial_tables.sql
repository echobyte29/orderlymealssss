-- Create customers table
create table customers (
  id uuid not null primary key references auth.users (id),
  name text,
  email text,
  phone_number text,
  address text
);

-- Create menu_items table
create table menu_items (
  id serial primary key,
  name text not null,
  description text,
  price numeric not null,
  image text,
  category text,
  available boolean default true,
  is_veg boolean default false
);

-- Create orders table
create table orders (
  id serial primary key,
  customer_id uuid not null references customers (id),
  order_summary jsonb not null,
  total_amount numeric not null,
  payment_status text not null,
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table customers enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;

create policy "Customers can view their own data" on customers for select using (auth.uid() = id);
create policy "Customers can update their own data" on customers for update using (auth.uid() = id);

create policy "All users can view menu items" on menu_items for select using (true);
create policy "Admin can insert menu items" on menu_items for insert with check (auth.role() = 'service_role');
create policy "Admin can update menu items" on menu_items for update with check (auth.role() = 'service_role');
create policy "Admin can delete menu items" on menu_items for delete using (auth.role() = 'service_role');

create policy "Customers can view their own orders" on orders for select using (auth.uid() = customer_id);
create policy "Customers can create orders" on orders for insert with check (auth.uid() = customer_id);
create policy "Admin can view all orders" on orders for select using (auth.role() = 'service_role');
