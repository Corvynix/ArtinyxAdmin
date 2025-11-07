# Quick Fix for 500 Errors

## The Problem

You're seeing `500 Internal Server Error` because the database tables don't exist yet.

## The Solution (3 Steps)

### Step 1: Run the Database Schema

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/xfnsmtuiqovgtkikxmed
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/schema.sql` from your project
5. Copy the **entire contents** of the file
6. Paste into Supabase SQL Editor
7. Click **Run** (or press F5)
8. Wait for "Success" message

### Step 2: Verify Tables Were Created

In the same SQL Editor, run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see at least:
- `artworks`
- `orders`
- `bids`
- `analytics_events`
- `admin_settings`

### Step 3: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Verify It's Fixed

1. Open browser console (F12)
2. Refresh the page
3. Check Network tab - `/api/artworks` should return `200 OK` (not 500)
4. The response should be `[]` (empty array) if no artworks exist yet

## Still Getting 500 Errors?

### Check Server Console

Look at the terminal where `npm run dev` is running. You should now see detailed error messages like:

```
Error fetching artworks: relation "artworks" does not exist
```

This tells you exactly what's wrong.

### Common Issues

1. **"relation 'artworks' does not exist"**
   - ✅ Solution: Run `supabase/schema.sql` in Supabase SQL Editor

2. **"password authentication failed"**
   - ✅ Solution: Check `DATABASE_URL` in `.env` file has correct password

3. **"connection refused"**
   - ✅ Solution: Check Supabase project is active (not paused)

### Test Database Connection

Run this in Supabase SQL Editor:

```sql
-- Should return current timestamp
SELECT NOW();

-- Should return 0 (no artworks yet)
SELECT COUNT(*) FROM artworks;
```

If the second query fails, tables don't exist - run the schema!

## Expected Result

After fixing:
- ✅ No 500 errors in browser console
- ✅ `/api/artworks` returns `200 OK` with `[]`
- ✅ `/api/analytics` accepts POST requests
- ✅ Server logs show successful database queries

## Next Steps

Once the 500 errors are fixed:
1. Seed some initial artworks (optional)
2. Test the full application flow
3. Deploy to Netlify

