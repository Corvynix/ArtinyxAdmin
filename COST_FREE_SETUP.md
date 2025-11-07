# Zero-Cost Production Setup Guide

This application is designed to run **completely free** using only:
- **Supabase Free Tier** (PostgreSQL database, storage, auth)
- **Netlify Free Tier** (hosting)

## Free Services Used

### ✅ Supabase (Free Tier)
- **Database**: PostgreSQL with 500MB storage
- **Storage**: 1GB file storage
- **Auth**: Unlimited users (free tier)
- **Email**: Built-in email sending (limited but sufficient for notifications)
- **API**: REST and GraphQL APIs included

**Limits (Free Tier):**
- 500MB database storage
- 1GB file storage
- 2GB bandwidth/month
- 50,000 monthly active users

### ✅ Netlify (Free Tier)
- **Hosting**: Static site hosting
- **Serverless Functions**: 125,000 requests/month
- **Bandwidth**: 100GB/month
- **Build minutes**: 300 minutes/month

## Optional Services (Not Required)

### Email Service
- **Current**: Uses nodemailer with SMTP (can use free Gmail SMTP)
- **Alternative**: Supabase built-in email (free tier includes email sending)
- **Status**: Works without credentials (gracefully disabled)

### SMS/WhatsApp Service
- **Current**: Uses Twilio (paid service)
- **Status**: **Completely optional** - works without credentials
- **Alternative**: Use WhatsApp Business API (free for small volumes) or remove entirely

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | **$0/month** | Free tier sufficient for small-medium apps |
| Netlify | **$0/month** | Free tier sufficient for most use cases |
| Email (SMTP) | **$0/month** | Use free Gmail SMTP or Supabase email |
| SMS/WhatsApp | **$0/month** | Optional - disabled by default |
| **Total** | **$0/month** | ✅ Completely free |

## Setup Instructions

### 1. Supabase Setup (Free)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project (free tier)
3. Get your connection string from Project Settings > Database
4. Get your API keys from Project Settings > API

### 2. Netlify Setup (Free)
1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist/public`
5. Add environment variables (see `.env.example`)

### 3. Environment Variables (All Free)

```env
# Supabase (Free)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
VITE_SUPABASE_URL=https://[PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]

# Optional - Free Gmail SMTP (if you want email notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Generate from Google Account settings

# Session Secret (generate random string)
SESSION_SECRET=[RANDOM_STRING]

# Admin Email
ADMIN_EMAIL=admin@yourdomain.com
```

## Removing Paid Dependencies (Optional)

If you want to completely remove Twilio dependency:

```bash
npm uninstall twilio
```

Then update `server/services/sms.ts` to remove Twilio imports. The service already gracefully handles missing credentials.

## Scaling Beyond Free Tier

If you need more resources:

| Service | Upgrade Cost | When Needed |
|---------|--------------|-------------|
| Supabase Pro | $25/month | >500MB database or >50k users |
| Netlify Pro | $19/month | >100GB bandwidth or >300 build min |

**Current setup supports:**
- Small to medium art marketplace
- Hundreds of artworks
- Thousands of orders/month
- All core features

## Monitoring Costs

- **Supabase Dashboard**: Monitor database size, bandwidth usage
- **Netlify Dashboard**: Monitor bandwidth, build minutes
- **Set alerts**: Configure usage alerts before hitting limits

## Support

All services used are free tier and don't require payment. The app works completely without any paid APIs.

