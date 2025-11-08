# Artinyxus - Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Prerequisites
- Netlify account
- Supabase project (free tier)
- GitHub repository

### Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project reference ID

2. **Run Database Schema**
   - Go to SQL Editor in Supabase Dashboard
   - Copy entire contents of `supabase/schema.sql`
   - Paste and run in SQL Editor
   - Verify all tables created

3. **Get Connection String**
   - Go to Settings > Database
   - Copy Connection String (URI format)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

4. **Get Supabase Client Keys**
   - Go to Settings > API
   - Copy `Project URL` → `VITE_SUPABASE_URL`
   - Copy `anon public` key → `VITE_SUPABASE_ANON_KEY`

### Step 2: Netlify Setup

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist/public`
   - Node version: `20`

3. **Set Environment Variables**
   Go to Site settings > Environment variables and add:

   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
   VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   SESSION_SECRET=[GENERATE-RANDOM-STRING]
   NODE_ENV=production
   ```

   **Generate SESSION_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 3: Deploy

1. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Netlify Auto-Deploy**
   - Netlify will automatically detect the push
   - Build will start automatically
   - Wait for deployment to complete

3. **Verify Deployment**
   - Visit your Netlify URL
   - Test homepage loads
   - Test artwork pages
   - Test admin panel (if configured)

### Step 4: Post-Deployment

1. **Set Up Scheduled Jobs** (Optional)
   - Go to Supabase Dashboard > Database > Functions
   - Set up cron job to call `fn_restore_expired_holds()` daily
   - Or use Supabase Edge Functions

2. **Configure Custom Domain** (Optional)
   - Go to Site settings > Domain management
   - Add your custom domain
   - Update DNS records

3. **Enable Analytics** (Optional)
   - Go to Site settings > Analytics
   - Enable Netlify Analytics (paid) or use Google Analytics

## 🔧 Troubleshooting

### Build Fails
- Check Node version is 20
- Verify all environment variables are set
- Check build logs for specific errors

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check Supabase project is active (not paused)
- Verify database password is correct

### 500 Errors on API Routes
- Check server logs in Netlify Functions
- Verify database schema is deployed
- Check environment variables are set correctly

### Admin Panel Not Accessible
- In production, requires proper authentication
- Set up Replit Auth or Supabase Auth
- Or use Supabase Dashboard for admin tasks

## 📋 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key (public) |
| `SESSION_SECRET` | ✅ | Random string for session encryption |
| `NODE_ENV` | ✅ | Set to `production` |
| `REPL_ID` | ❌ | Only if using Replit Auth |
| `ADMIN_EMAIL` | ❌ | For email notifications |
| `SMTP_*` | ❌ | For email service (optional) |
| `TWILIO_*` | ❌ | For SMS service (optional) |

## 🎯 Zero-Cost Deployment

This app is designed for **zero-cost production**:
- ✅ Supabase Free Tier (500MB database, 2GB bandwidth)
- ✅ Netlify Free Tier (100GB bandwidth, 300 build minutes/month)
- ✅ No paid API dependencies
- ✅ Email/SMS services are optional

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Schema Setup Guide](./supabase/README.md)
- [Environment Setup Guide](./README_ENV_SETUP.md)

## ✅ Pre-Launch Checklist

- [ ] Database schema deployed
- [ ] Environment variables set in Netlify
- [ ] Build succeeds
- [ ] Homepage loads correctly
- [ ] Artwork pages work
- [ ] WhatsApp order flow works
- [ ] Admin panel accessible (if configured)
- [ ] Custom domain configured (optional)
- [ ] Analytics configured (optional)

---

**Ready to launch! 🚀**

