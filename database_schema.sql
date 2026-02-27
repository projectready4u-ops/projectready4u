-- Projectready4U Database Schema
-- Run this SQL in Supabase SQL Editor

-- 1. PROJECTS TABLE
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  abstract TEXT,
  synopsis TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discounted_price DECIMAL(10, 2),
  discount_percent INTEGER DEFAULT 0,
  github_repo_link TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  includes_source BOOLEAN DEFAULT true,
  includes_report BOOLEAN DEFAULT true,
  includes_ppt BOOLEAN DEFAULT true,
  includes_synopsis BOOLEAN DEFAULT true,
  includes_viva BOOLEAN DEFAULT true,
  includes_readme BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);

-- 2. PROJECT_REQUESTS TABLE
CREATE TABLE project_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  college_name TEXT NOT NULL,
  branch TEXT,
  semester TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  amount_paid DECIMAL(10, 2),
  payment_method TEXT,
  payment_reference TEXT,
  download_link TEXT,
  download_link_expires_at TIMESTAMP WITH TIME ZONE,
  downloads_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_requests_project_id ON project_requests(project_id);
CREATE INDEX idx_requests_user_email ON project_requests(user_email);
CREATE INDEX idx_requests_status ON project_requests(status);
CREATE INDEX idx_requests_created_at ON project_requests(created_at DESC);

-- 3. DOWNLOADS TABLE
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES project_requests(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  download_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_downloads_request_id ON downloads(request_id);
CREATE INDEX idx_downloads_project_id ON downloads(project_id);
CREATE INDEX idx_downloads_user_email ON downloads(user_email);

-- 4. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO categories (name, slug, icon) VALUES
  ('Web Development', 'web-development', '🌐'),
  ('Mobile App', 'mobile-app', '📱'),
  ('Machine Learning', 'machine-learning', '🤖'),
  ('Database', 'database', '🗄️'),
  ('DevOps', 'devops', '⚙️'),
  ('Game Development', 'game-development', '🎮'),
  ('Data Science', 'data-science', '📊'),
  ('Cloud Computing', 'cloud-computing', '☁️')
ON CONFLICT DO NOTHING;

-- 5. ADMIN_SETTINGS TABLE
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('site_name', 'Projectready4U', 'Website name'),
  ('site_description', 'Academic Project Marketplace', 'Site description'),
  ('contact_email', 'admin@projectready4u.com', 'Admin contact email'),
  ('whatsapp_number', '919876543210', 'WhatsApp business number'),
  ('currency', 'INR', 'Default currency')
ON CONFLICT DO NOTHING;

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_public_read" ON projects FOR SELECT USING (true);

ALTER TABLE project_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests_insert" ON project_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests_select" ON project_requests FOR SELECT USING (true);
CREATE POLICY "requests_update" ON project_requests FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON admin_settings FOR SELECT USING (true);

-- Done!
