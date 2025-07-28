create table categories (
  id serial primary key,
  name text not null unique,
  position integer
);

alter table menu_items
add column category_id integer references categories(id),
add column position integer;

insert into categories (name, position)
values
  ('Main Course', 1),
  ('Rice', 2),
  ('South Indian', 3),
  ('Desserts', 4),
  ('Beverages', 5);

update menu_items
set category_id = (select id from categories where name = menu_items.category);

alter table menu_items
drop column category;
