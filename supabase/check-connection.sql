-- Quick connection test script
-- Run this in Supabase SQL Editor to verify your database is working

-- Test 1: Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('artworks', 'orders', 'bids', 'analytics_events')
ORDER BY table_name;

-- Test 2: Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE 'fn_%'
ORDER BY routine_name;

-- Test 3: Check if triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Test 4: Try a simple query on artworks (will fail if table doesn't exist)
SELECT COUNT(*) as artwork_count FROM artworks;

-- Test 5: Check admin settings
SELECT key, value FROM admin_settings;

