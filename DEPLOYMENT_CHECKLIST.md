# Netlify Deployment Checklist

## Pre-Deployment

- [x] Database migrated to Supabase
- [x] All paid services made optional
- [x] Windows compatibility fixed
- [x] Socket errors fixed
- [x] TypeScript errors fixed
- [x] Build passes successfully

## Environment Variables (Set in Netlify)

### Required
- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SESSION_SECRET` - Random secure string

### Optional
- [ ] `ADMIN_EMAIL` - Admin email for notifications
- [ ] `EMAIL_USER` - Gmail for email notifications (free)
- [ ] `EMAIL_PASSWORD` - Gmail app password (free)
- [ ] `PORT` - Server port (default: 5000, Netlify auto-sets)

## Netlify Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Node version**: 20.x (or latest LTS)

## Post-Deployment

- [ ] Test public routes (artworks, orders)
- [ ] Test admin routes (if auth configured)
- [ ] Verify database connections
- [ ] Check logs for errors
- [ ] Monitor Supabase usage (stay within free tier)
- [ ] Monitor Netlify usage (stay within free tier)

## Cost Verification

- [ ] Supabase: Free tier (500MB DB, 1GB storage)
- [ ] Netlify: Free tier (100GB bandwidth, 300 build min)
- [ ] Email: Free (Gmail SMTP or Supabase email)
- [ ] SMS: Disabled (optional, not required)
- [ ] **Total Cost: $0/month** ✅

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Verify database password is correct

### Build Failures
- Check Node version (use 20.x)
- Verify all dependencies installed
- Check build logs for errors

### Runtime Errors
- Check Netlify function logs
- Verify environment variables are set
- Check Supabase dashboard for errors

