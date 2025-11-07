# Troubleshooting Guide

## 500 Internal Server Error on API Endpoints

### Common Causes

1. **Database tables don't exist**
   - Run `supabase/schema.sql` in Supabase SQL Editor
   - Verify tables were created

2. **DATABASE_URL not set or incorrect**
   - Check `.env` file exists
   - Verify `DATABASE_URL` has correct Supabase password
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

3. **Database connection failed**
   - Check Supabase project is active
   - Verify database password is correct
   - Check network connectivity

### Step-by-Step Debugging

#### Step 1: Check Server Logs

Look at the terminal where `npm run dev` is running. You should see detailed error messages like:
```
Error fetching artworks: [error details]
```

#### Step 2: Verify Database Connection

1. Check `.env` file exists and has `DATABASE_URL`:
   ```bash
   # Windows PowerShell
   Get-Content .env | Select-String "DATABASE_URL"
   ```

2. Test connection manually:
   - Go to Supabase Dashboard > SQL Editor
   - Run `supabase/check-connection.sql`
   - Verify all tables exist

#### Step 3: Run Database Schema

If tables don't exist:

1. Go to Supabase Dashboard > SQL Editor
2. Copy entire contents of `supabase/schema.sql`
3. Paste and click **Run**
4. Verify no errors

#### Step 4: Check Environment Variables

Make sure these are set in `.env`:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xfnsmtuiqovgtkikxmed.supabase.co:5432/postgres
VITE_SUPABASE_URL=https://xfnsmtuiqovgtkikxmed.supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SESSION_SECRET=[RANDOM-STRING]
```

#### Step 5: Test Database Connection

Run this in Supabase SQL Editor:
```sql
-- Test connection
SELECT NOW();

-- Check if artworks table exists
SELECT COUNT(*) FROM artworks;
```

### Common Error Messages

#### "relation 'artworks' does not exist"
**Solution**: Run `supabase/schema.sql` to create tables

#### "password authentication failed"
**Solution**: Check `DATABASE_URL` password is correct

#### "connection refused"
**Solution**: 
- Check Supabase project is active
- Verify connection string format
- Check firewall/network settings

#### "Failed to fetch artworks" (500)
**Solution**: 
- Check server logs for detailed error
- Verify database connection
- Ensure tables exist

### Quick Fixes

1. **Restart the dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Verify .env file**:
   ```bash
   # Check if .env exists
   Test-Path .env
   
   # View DATABASE_URL (masked)
   Get-Content .env | Select-String "DATABASE_URL"
   ```

3. **Test database directly**:
   - Use Supabase SQL Editor
   - Run: `SELECT * FROM artworks LIMIT 1;`
   - If this fails, tables don't exist

### Still Not Working?

1. **Check Supabase Dashboard**:
   - Go to Project Settings > Database
   - Verify connection string format
   - Check if database is paused (free tier)

2. **Check Server Console**:
   - Look for detailed error messages
   - Check if `DATABASE_URL` is being read
   - Verify dotenv is loading `.env` file

3. **Manual Connection Test**:
   ```sql
   -- In Supabase SQL Editor
   SELECT 
     current_database() as database,
     current_user as user,
     version() as postgres_version;
   ```

### Expected Behavior

After fixing:
- ✅ `/api/artworks` returns `[]` (empty array if no artworks)
- ✅ `/api/analytics` accepts POST requests
- ✅ No 500 errors in browser console
- ✅ Server logs show successful queries

### Next Steps After Fixing

1. Run database migrations: `npm run db:push`
2. Seed initial data (if you have seed script)
3. Test all API endpoints
4. Verify frontend loads without errors

