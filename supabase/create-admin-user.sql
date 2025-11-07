-- Create Admin User for Admin Panel Access
-- Run this in Supabase SQL Editor after running schema.sql

-- Option 1: Create admin user with email (for Supabase Auth integration)
-- Replace 'your-email@example.com' with your actual email
INSERT INTO users (id, email, first_name, last_name, is_admin)
VALUES (
  gen_random_uuid()::text,
  'your-email@example.com',
  'Admin',
  'User',
  true
)
ON CONFLICT (email) DO UPDATE SET is_admin = true;

-- Option 2: Create admin user with a specific ID (for custom auth)
-- Replace 'admin-user-id' with your preferred ID
INSERT INTO users (id, email, first_name, last_name, is_admin)
VALUES (
  'admin-user-id',
  'admin@artinyxus.com',
  'Admin',
  'User',
  true
)
ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- Verify admin user was created
SELECT id, email, first_name, last_name, is_admin, created_at
FROM users
WHERE is_admin = true;

