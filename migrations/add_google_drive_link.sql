-- Add google_drive_link column to projects table
-- Run this SQL in Supabase SQL Editor

ALTER TABLE projects
ADD COLUMN google_drive_link TEXT;

-- Add index for better query performance
CREATE INDEX idx_projects_google_drive_link ON projects(google_drive_link) WHERE google_drive_link IS NOT NULL;
