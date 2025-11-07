# Supabase Schema Setup Guide

## 🚀 Quick Start

### 1. Run the Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run**

### 2. Verify Tables

After running the schema, verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- `admin_audit`
- `admin_settings`
- `analytics_events`
- `artworks`
- `bids`
- `buyer_limits`
- `inventory_alerts`
- `notifications`
- `orders`
- `production_slots`
- `rate_limit_violations`
- `sessions`
- `users`

### 3. Set Up Scheduled Job (Auto-Restore Holds)

#### Option A: Supabase Edge Function (Recommended)

Create a Supabase Edge Function that runs every hour:

1. Go to **Edge Functions** in Supabase Dashboard
2. Create new function: `restore-expired-holds`
3. Use the code from `supabase/functions/restore-expired-holds/index.ts`

#### Option B: Netlify Scheduled Function

Create a Netlify Function that calls your API endpoint:

```javascript
// netlify/functions/restore-holds.js
exports.handler = async (event, context) => {
  const response = await fetch(`${process.env.API_URL}/api/restore-holds`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

Then schedule it in `netlify.toml`:

```toml
[build]
  functions = "netlify/functions"

[[plugins]]
  package = "@netlify/plugin-scheduled-functions"
  
[[schedules]]
  cron = "0 * * * *"  # Every hour
  function = "restore-holds"
```

### 4. Configure Supabase SMTP (for Email Alerts)

1. Go to **Project Settings** > **Auth** > **SMTP Settings**
2. Configure your SMTP provider (Gmail, SendGrid, etc.)
3. Or use Supabase's built-in email (free tier includes email)

### 5. Test the Functions

```sql
-- Test hold stock
SELECT fn_hold_stock('artwork-id', 'M', 1);

-- Test restore stock
SELECT fn_restore_stock('artwork-id', 'M', 1);

-- Test restore expired holds
SELECT fn_restore_expired_holds();

-- Test extend auction
SELECT fn_extend_auction_sniping('artwork-id');

-- Test low stock check
SELECT fn_check_low_stock('artwork-id', 'M');
```

## 📊 Schema Features

### ✅ Complete Tables
- All tables from TypeScript schema
- Proper indexes for performance
- Foreign key constraints
- Check constraints for data integrity

### ✅ Business Logic Functions
- `fn_hold_stock()` - Decrement stock atomically
- `fn_restore_stock()` - Increment stock atomically
- `fn_restore_expired_holds()` - Auto-restore expired holds
- `fn_extend_auction_sniping()` - Anti-sniping protection
- `fn_check_low_stock()` - Check and create low stock alerts

### ✅ Automated Triggers
- Low stock alerts after order creation
- Update current bid after bid placement
- Extend auction if bid in last 60 seconds
- Update timestamps automatically

### ✅ Performance Optimizations
- Indexes on all foreign keys
- Indexes on frequently queried columns
- Partial indexes for filtered queries
- Unique indexes for data integrity

## 🔧 Maintenance

### Run Restore Holds Manually

```sql
SELECT fn_restore_expired_holds();
```

### Check Low Stock Alerts

```sql
SELECT * FROM inventory_alerts WHERE alert_sent = false;
```

### Monitor Expired Holds

```sql
SELECT COUNT(*) 
FROM orders 
WHERE status = 'pending' 
  AND hold_expires_at < NOW();
```

## 🎯 What This Schema Provides

1. **100% Production Ready** - All tables, functions, triggers
2. **Automated Business Logic** - Stock holds, restores, alerts
3. **Performance Optimized** - Proper indexes for fast queries
4. **Data Integrity** - Foreign keys, constraints, checks
5. **Zero-Cost** - Works with Supabase free tier

## 📝 Next Steps

1. ✅ Run `schema.sql` in Supabase SQL Editor
2. ✅ Set up scheduled job for auto-restore
3. ✅ Configure SMTP for email alerts
4. ✅ Run `npm run db:push` to sync Drizzle schema
5. ✅ Seed initial data with artworks

Your app is now 100% ready! 🚀

