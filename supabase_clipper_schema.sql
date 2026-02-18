-- Create table for storing Clipper Analysis results (Polling mechanism)
create table if not exists public.clipper_analysis_jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'ANALYZING', -- Values: 'ANALYZING', 'COMPLETED', 'FAILED'
  youtube_link text,
  ip_media text,
  clips_result jsonb, -- Stores the JSON array of clips from LLM
  error_message text
);

-- Enable Row Level Security (RLS) is recommended
alter table public.clipper_analysis_jobs enable row level security;

-- Policy: Allow public access (internal tool usage)
-- You can restrict this later if needed, but for now we allow the app to Read/Write
create policy "Enable read access for all users"
on public.clipper_analysis_jobs
for select
using (true);

create policy "Enable insert access for all users"
on public.clipper_analysis_jobs
for insert
with check (true);

create policy "Enable update access for all users"
on public.clipper_analysis_jobs
for update
using (true);
