# Database Connection Fix

## Current Error

```
getaddrinfo ENOTFOUND db.xfnsmtuiqovgtkikxmed.supabase.co
```

This means the app cannot reach your Supabase database.

## Quick Fix Steps

### 1. Check Supabase Project Status

Go to: https://supabase.com/dashboard/project/xfnsmtuiqovgtkikxmed

**If the project is paused:**
- Click "Restore" or "Resume" to activate it
- Wait a few minutes for it to come online
- Free tier projects pause after 7 days of inactivity

**If the project is active:**
- Continue to step 2

### 2. Verify DATABASE_URL

Your `.env` file should have:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xfnsmtuiqovgtkikxmed.supabase.co:5432/postgres
```

**Get your database password:**
1. Go to: https://supabase.com/dashboard/project/xfnsmtuiqovgtkikxmed/settings/database
2. Find the **Database password** section
3. If you don't remember it, click **Reset database password**
4. Copy the new password
5. Update `.env` file with the correct password

### 3. Test Connection

After updating `.env`, restart your dev server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 4. Run Database Schema

If the connection works but you still see errors:

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/xfnsmtuiqovgtkikxmed/sql/new
2. Open `supabase/schema.sql` from your project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **Run** (or press F5)
6. Wait for "Success" message

## What's Working Now

Even with database connection issues:
- ✅ Auth endpoint returns mock admin user in dev mode
- ✅ Login button works in development
- ✅ Admin panel accessible (with mock data)
- ✅ Better error messages guide you to fix the issue

## Still Having Issues?

1. **Check server logs** - Look at the terminal where `npm run dev` is running
2. **Verify network** - Make sure you can access supabase.com
3. **Check firewall** - Some networks block database connections
4. **Try connection pooling URL** - Use the connection pooling URL from Supabase settings instead

## Connection Pooling URL (Alternative)

If direct connection doesn't work, try the connection pooling URL:

1. Go to: https://supabase.com/dashboard/project/xfnsmtuiqovgtkikxmed/settings/database
2. Find **Connection string** section
3. Select **Connection pooling** tab
4. Copy the **URI** format
5. Update `DATABASE_URL` in `.env` with this URL

The pooling URL looks like:
```
postgresql://postgres.xfnsmtuiqovgtkikxmed:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

