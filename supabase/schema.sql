-- DRAFT schema for moving the customer app off the mock backend.
-- Mirrors src/types/index.ts. Not applied anywhere yet.
-- Pricing and stock are authoritative server-side: the client only sends variant_id + quantity.

create table categories (
  id text primary key,
  name text not null,
  sort_order int default 0
);

create table products (
  id text primary key,
  slug text unique not null,
  name text not null,
  aliases text[] default '{}',
  category_id text references categories(id),
  type text not null,
  description text not null,
  unit jsonb not null,               -- SellingUnit
  attributes jsonb not null,         -- ProductAttribute[]
  recommended_variant_id text,
  recommended_reason text,
  default_qty int not null,
  storage_tip text,
  sourcing_note text,
  shelf_life_days int,
  image_url text,
  is_active boolean default true
);

create table product_variants (
  id text primary key,
  product_id text references products(id) on delete cascade,
  sku text unique not null,
  attributes jsonb not null,         -- {"colour":"red","size":"medium"}
  grade text not null default 'standard',
  price numeric(10,2) not null,      -- per unit.baseQty grams, or per count unit
  mrp numeric(10,2),
  note text
);

-- Daily stock after grading (future: linked to batches / procurement).
create table inventory (
  variant_id text references product_variants(id),
  stock_date date not null default current_date,
  status text not null check (status in ('in_stock','low_stock','out_of_stock')),
  quantity_available numeric,
  primary key (variant_id, stock_date)
);

create table customers (
  id uuid primary key references auth.users(id),
  name text,
  phone text,
  email text,
  created_at timestamptz default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  label text, name text, phone text, house text, street text, area text,
  city text, pincode text, landmark text, is_default boolean default false
);

create table customer_preferences (
  customer_id uuid references customers(id) on delete cascade,
  product_id text references products(id),
  attributes jsonb not null,
  quantity int not null,
  source text not null check (source in ('saved','learned')),
  updated_at timestamptz default now(),
  primary key (customer_id, product_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  customer_id uuid references customers(id),
  address jsonb not null,            -- snapshot at order time
  slot jsonb not null,
  payment_method text not null,
  subtotal numeric(10,2), delivery_fee numeric(10,2), discount numeric(10,2), total numeric(10,2),
  note text,
  placed_at timestamptz default now()
);

create table order_items (
  order_id uuid references orders(id) on delete cascade,
  variant_id text references product_variants(id),
  product_name text, variant_label text, attributes jsonb,
  quantity int not null, unit_price numeric(10,2), line_total numeric(10,2)
);

create table order_status_events (
  order_id uuid references orders(id) on delete cascade,
  status text not null,
  at timestamptz default now()
);

create table quality_feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  rating int check (rating between 1 and 5),
  issues text[] default '{}',
  item_variant_ids text[] default '{}',
  comment text,
  status text default 'received',
  created_at timestamptz default now()
);

-- Enable RLS on customer-owned tables; customers read/write only their own rows.
alter table customers enable row level security;
alter table addresses enable row level security;
alter table customer_preferences enable row level security;
alter table orders enable row level security;
alter table quality_feedback enable row level security;
