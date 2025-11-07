# Quick Start Guide

## ⚠️ IMPORTANT: Database Setup Required

The app is currently showing 500 errors because the database connection is not configured.

### Step 1: Get Your Supabase Database Password

1. Go to: https://supabase.com/dashboard/project/xfnsmtuiqovgtkikxmed/settings/database
2. Find the **Database password** section
3. If you don't remember it, click **Reset database password**
4. Copy the password

### Step 2: Update .env File

Open `.env` file in the project root and replace `[YOUR-PASSWORD]` with your actual Supabase password:

```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xfnsmtuiqovgtkikxmed.supabase.co:5432/postgres
```

### Step 3: Run Database Migrations

```bash
npm run db:push
```

This will create all the necessary tables in your Supabase database.

### Step 4: Start the App

```bash
npm run dev
```

The app should now work without 500 errors!

## Troubleshooting

### Error: "DATABASE_URL must be set"
- Make sure `.env` file exists in the project root
- Check that `DATABASE_URL` is set correctly

### Error: "Failed to fetch artworks" (500)
- Database password is incorrect or not set
- Database tables don't exist (run `npm run db:push`)
- Check Supabase dashboard to verify connection

### Error: "listen ENOTSUP"
- Fixed! The socket error has been resolved
- If you still see it, restart the dev server

## Current Status

✅ Socket error fixed
✅ Windows compatibility fixed
✅ Supabase migration complete
⚠️ **Database password needs to be set in .env file**

