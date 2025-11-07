# Environment Variables Setup

## Quick Start

1. **Get your Supabase database password:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project: `xfnsmtuiqovgtkikxmed`
   - Navigate to: **Project Settings** > **Database**
   - Find your **Database password** (or reset it if needed)

2. **Create a `.env` file in the project root:**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xfnsmtuiqovgtkikxmed.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmbnNtdHVpcW92Z3RraWt4bWVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzMxNzUsImV4cCI6MjA3ODEwOTE3NX0.Y0v6lpRbMXUStal9M9dpBVOlTLGNzjwWKq3xuPSBswg

# Supabase PostgreSQL Connection String
# Replace [YOUR-PASSWORD] with your actual Supabase database password
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xfnsmtuiqovgtkikxmed.supabase.co:5432/postgres

# Session Secret (generate a random string)
SESSION_SECRET=your-session-secret-change-this-to-random-string

# Admin Email
ADMIN_EMAIL=admin@artinyxus.com
```

3. **Generate a secure SESSION_SECRET:**
   ```bash
   # On Windows PowerShell:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   
   # Or use an online generator: https://randomkeygen.com/
   ```

## Alternative: Using Connection Pooler (Recommended for Production)

For better performance and connection management, use the connection pooler:

```env
DATABASE_URL=postgresql://postgres.xfnsmtuiqovgtkikxmed:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Replace `[REGION]` with your Supabase region (e.g., `us-east-1`, `eu-west-1`).

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | ✅ Yes |
| `VITE_SUPABASE_URL` | Supabase project URL (for client) | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (for client) | ✅ Yes |
| `SESSION_SECRET` | Secret for session encryption | ✅ Yes |
| `ADMIN_EMAIL` | Admin email for notifications | ⚠️ Optional |

## Optional Environment Variables

- `PORT` - Server port (default: 5000)
- `REPL_ID` - Replit environment identifier (if using Replit)
- `ISSUER_URL` - OIDC issuer URL (default: https://replit.com/oidc)
- `EMAIL_USER`, `EMAIL_PASSWORD` - SMTP credentials
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - SMS/WhatsApp credentials

## For Netlify Deployment

Set these environment variables in Netlify Dashboard:
1. Go to **Site settings** > **Environment variables**
2. Add all the variables from your `.env` file
3. Make sure `VITE_*` variables are available at build time

## Troubleshooting

**Error: DATABASE_URL must be set**
- Make sure `.env` file exists in the project root
- Check that `DATABASE_URL` is correctly formatted
- Verify your Supabase database password is correct

**Error: Missing Supabase environment variables**
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- For Vite, variables must start with `VITE_` to be exposed to client

