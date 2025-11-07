# Admin Panel Access Guide

## 🎉 Quick Access (Development Mode)

**In development mode, admin access is now automatic!**

Simply:
1. **Navigate to**: `http://localhost:5000/admin`
2. **That's it!** The admin panel will work automatically in development

The app automatically:
- ✅ Creates an admin user in the database
- ✅ Authenticates you with a dev API key
- ✅ Grants admin access to all routes

**No setup required for development!**

## Production Setup

For production (Netlify), you'll need proper authentication:

### Option 1: Create Admin User Directly (Recommended for Development)

1. **Run the admin user creation script**:
   - Go to Supabase Dashboard > SQL Editor
   - Open `supabase/create-admin-user.sql`
   - Replace `'your-email@example.com'` with your email
   - Run the script

2. **Set up simple authentication** (see Option 2 or 3 below)

### Option 2: Use Supabase Auth (Recommended for Production)

Since Replit Auth is optional, you can use Supabase Auth instead:

1. **Enable Supabase Auth**:
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Email provider
   - Configure email templates

2. **Update authentication code** to use Supabase Auth instead of Replit Auth

3. **Create admin user**:
   - Sign up with your email via Supabase Auth
   - Then run SQL to set `is_admin = true`:
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE email = 'your-email@example.com';
   ```

### Option 3: Temporary Development Bypass (Quick Fix)

For development/testing, you can temporarily bypass authentication:

1. **Create admin user in database** (run in Supabase SQL Editor):
   ```sql
   INSERT INTO users (id, email, first_name, last_name, is_admin)
   VALUES (
     'dev-admin-123',
     'admin@artinyxus.com',
     'Admin',
     'User',
     true
   );
   ```

2. **Temporarily modify authentication** (for development only):
   - This is a quick workaround - not for production!

## Admin Panel Routes

Once authenticated as admin, you can access:

- `/admin` - Main dashboard
- `/admin/artworks` - Manage artworks
- `/admin/orders` - Manage orders
- `/admin/bids` - View bids
- `/admin/analytics` - Analytics dashboard
- `/admin/capacity` - Production capacity management

## Current Authentication Status

**Replit Auth**: ⚠️ Disabled (REPL_ID not set)
- Admin routes will return 401 Unauthorized
- Need to set up alternative authentication

## Recommended Solution

For **zero-cost production** with Netlify:

1. **Use Supabase Auth** (free tier):
   - Enable in Supabase Dashboard
   - Update `server/replitAuth.ts` to use Supabase Auth
   - Create admin user via Supabase Auth UI
   - Set `is_admin = true` in database

2. **Or create a simple API key system**:
   - Add API key authentication for admin routes
   - Store API key in environment variables
   - Use for Netlify deployment

## Quick Test (Development)

To test admin panel without full auth setup:

1. Create admin user in database (see SQL above)
2. Temporarily modify `isAdmin` middleware to allow access
3. Access `/admin` directly

**Note**: This is for development only. For production, use proper authentication.

