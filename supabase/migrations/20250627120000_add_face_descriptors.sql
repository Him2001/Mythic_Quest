-- Create table for storing face descriptors
create table if not exists face_descriptors (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  descriptor float8[] not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table face_descriptors enable row level security;

-- Allow anyone to read face descriptors (for recognition)
create policy "Anyone can read face descriptors"
  on face_descriptors for select
  using (true);

-- Allow anyone to insert their own face descriptor (for registration)
create policy "Anyone can insert face descriptors"
  on face_descriptors for insert
  with check (true);

-- Create index for faster lookups
create index if not exists idx_face_descriptors_username 
  on face_descriptors(username);
