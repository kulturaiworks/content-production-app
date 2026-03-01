-- ============================================================
-- Supabase Table Setup for Templates & Media
-- Run this ONCE in Supabase SQL Editor
-- After running, refresh the app → it will auto-seed data
-- ============================================================

-- STEP 1: Recreate templates table (safe - table is empty)
DROP TABLE IF EXISTS templates;
CREATE TABLE templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id text NOT NULL UNIQUE,
  media_name text NOT NULL,
  display_name text NOT NULL,
  backend_value text NOT NULL,
  type_category text NOT NULL DEFAULT 'Image',
  preview_image jsonb,
  asset_config jsonb,
  is_universal boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- STEP 2: Recreate media table
DROP TABLE IF EXISTS media;
CREATE TABLE media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  voice text,
  tone text,
  audience text,
  style text,
  hashtag_style text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- STEP 3: Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Read access for all (anon key from app)
CREATE POLICY "anon_read_templates" ON templates FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_media" ON media FOR SELECT TO anon USING (true);

-- Insert access for seeding (can restrict later)
CREATE POLICY "anon_insert_templates" ON templates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_insert_media" ON media FOR INSERT TO anon WITH CHECK (true);

-- Update access (for future admin edits via app)
CREATE POLICY "anon_update_templates" ON templates FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_update_media" ON media FOR UPDATE TO anon USING (true);

-- Delete access (for re-seeding)
CREATE POLICY "anon_delete_templates" ON templates FOR DELETE TO anon USING (true);
CREATE POLICY "anon_delete_media" ON media FOR DELETE TO anon USING (true);

-- STEP 4: Indexes for fast queries
CREATE INDEX idx_templates_media ON templates(media_name);
CREATE INDEX idx_templates_category ON templates(type_category);
CREATE INDEX idx_templates_universal ON templates(is_universal);
CREATE INDEX idx_media_name ON media(name);

-- ============================================================
-- DONE! Now refresh your app — it will auto-seed all template
-- data from the hardcoded mediaData.js into these tables.
-- ============================================================
