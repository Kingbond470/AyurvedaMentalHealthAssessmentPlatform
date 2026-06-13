# Production Setup - Vercel Deployment

## Database Configuration

### Issue
Items show "0 of 0" in Item Bank Management on Vercel because DATABASE_URL is not properly configured.

### Solution

1. **Set DATABASE_URL on Vercel**
   - Go to Vercel project settings: https://vercel.com/dashboard
   - Navigate to: Settings → Environment Variables
   - Add variable: `DATABASE_URL`
   - Value: Get from Supabase → Connection Strings → URI
   - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`
   - Make sure to:
     - Add `?schema=public` to the end if needed
     - Use the Supabase password (not your account password)

2. **Seed Database**
   - Option A (Local): Run locally with production DATABASE_URL
     ```bash
     DATABASE_URL="your_supabase_url" node scripts/seed-items.js
     ```
   - Option B (Vercel CLI):
     ```bash
     vercel env pull  # pulls environment variables
     node scripts/seed-items.js
     ```

3. **Verify**
   - Visit production URL: `/api/admin/items`
   - Should return array of 125 items (118 MPPI + 7 GAD-7)

## Environment Variables Required

| Variable | Example | Source |
|----------|---------|--------|
| DATABASE_URL | `postgresql://user:pass@host/db` | Supabase → Connection Strings |
| SUPABASE_URL | `https://xxx.supabase.co` | Supabase → Project Settings |
| SUPABASE_ANON_KEY | `eyJ...` | Supabase → Project Settings → API Keys |
| NEXT_PUBLIC_SUPABASE_URL | `https://xxx.supabase.co` | Same as SUPABASE_URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | `eyJ...` | Same as SUPABASE_ANON_KEY |

## Troubleshooting

- **"Showing 0 of 0 items"**: DATABASE_URL not set or incorrect
- **Supabase connection error**: Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set in Vercel env vars
- **Connection timeout**: Check Supabase IP whitelist includes Vercel IPs
