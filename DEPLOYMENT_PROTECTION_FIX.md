# Fix: Vercel Deployment Protection Blocking API Access

## Problem
Admin panel shows "0 of 0 items" because API calls are blocked by Vercel's deployment protection, which requires authentication to access any endpoint.

## Root Cause
Vercel automatically enables deployment protection for all deployments. This requires Vercel authentication to access the API, preventing the frontend from calling `/api/admin/items`.

## Solution: Disable Deployment Protection

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to: https://vercel.com/dashboard
2. Select project: `ayurveda-mental-health`
3. Navigate to: **Settings** → **Deployment Protection**
4. Click **Disable Deployment Protection**
5. Wait ~30 seconds for settings to apply
6. Refresh the admin panel
7. Items should now load (125 items: 118 MPPI + 7 GAD-7)

### Option 2: Via Vercel CLI (Automated)
```bash
# Remove deployment protection
vercel env remove VERCEL_DEPLOYMENT_PROTECTION_ENABLED --scope=project

# Or disable globally for the project
vercel project settings --default-deployment-protection=none
```

### Option 3: Keep Protection, Use Bypass Token
If you want to keep deployment protection enabled:
1. Via dashboard: Settings → Deployment Protection → Generate Token
2. Access via: `https://domain.com?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=TOKEN`

## Verification
After disabling protection:
- Health check: `https://domain/api/health` (no auth required)
- Should return: `{"status":"ok","items":125,"sessions":0}`
- Admin panel: Items should load correctly

## Current Status
- ✅ Database: Seeded with 125 items
- ✅ API: Functional
- ❌ Access: Blocked by deployment protection
- 🔧 Fix: Disable protection via dashboard (1-2 minutes)
