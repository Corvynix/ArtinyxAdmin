# Quick Admin Panel Access

## ✅ Development Mode (Automatic)

**Just navigate to**: `http://localhost:5000/admin`

That's it! The admin panel works automatically in development mode.

### What Happens Automatically:

1. ✅ Admin user is created in database (`dev-admin-user`)
2. ✅ API key authentication is used (`dev-admin-key-12345`)
3. ✅ All admin routes are accessible
4. ✅ No configuration needed

### Admin Panel Routes:

- `/admin` - Main dashboard
- `/admin/artworks` - Manage artworks
- `/admin/orders` - Manage orders  
- `/admin/bids` - View bids
- `/admin/analytics` - Analytics dashboard
- `/admin/capacity` - Production capacity

## 🔒 Production Mode

For production (Netlify), you need:

1. **Set up authentication** (Supabase Auth recommended)
2. **Create admin user** in database with `is_admin = true`
3. **Authenticate** via your chosen auth method

## 🛠️ Customize Dev API Key (Optional)

If you want to change the dev API key:

1. Add to `.env`:
   ```env
   DEV_ADMIN_API_KEY=your-custom-key
   ```

2. Restart dev server

## 📝 Notes

- **Development mode only**: This bypass only works when `NODE_ENV=development`
- **Production safe**: Production mode still requires proper authentication
- **Auto-creates user**: First access creates admin user automatically
- **Zero setup**: Works immediately after running database schema

## 🎯 Next Steps

1. Run database schema: `supabase/schema.sql`
2. Start dev server: `npm run dev`
3. Go to: `http://localhost:5000/admin`
4. Start managing your art marketplace! 🎨

