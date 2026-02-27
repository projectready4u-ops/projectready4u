# 🔑 Environment Variables Complete Guide

## What Are Environment Variables?

Environment variables are configuration values that your app needs at runtime. They're stored separately from code for security and flexibility.

---

## Local Development (.env.local)

Create a `.env.local` file in the project root with your actual credentials:

```env
# ═══════════════════════════════════════════════════════════════
# SUPABASE (Database & Auth)
# ═══════════════════════════════════════════════════════════════

# Go to Supabase Dashboard > Settings > API
# Copy "Project URL"
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Copy "anon public" key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Go to Settings > API > Service role secret (keep private!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ═══════════════════════════════════════════════════════════════
# RESEND (Email Sending)
# ═══════════════════════════════════════════════════════════════

# Get from https://resend.com/api-keys
RESEND_API_KEY=re_1234567890abcdef1234567890

# ═══════════════════════════════════════════════════════════════
# PUBLIC CONFIGURATION
# ═══════════════════════════════════════════════════════════════

# Your WhatsApp number (for floating WhatsApp button & links)
# Format: +91 (India) or your country code
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# Admin email (where requests are sent)
NEXT_PUBLIC_ADMIN_EMAIL=admin@yoursite.com

# Your site URL (for social sharing, emails, etc.)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Your UPI ID (optional, for payment references)
NEXT_PUBLIC_UPI_ID=yourname@paytm
```

---

## How to Get Each Variable

### 1. Supabase (Database)

**Project URL:**
1. Go to [supabase.com](https://supabase.com) → Dashboard
2. Select your project
3. Click **Settings** → **API**
4. Copy the **Project URL**
5. Paste into `NEXT_PUBLIC_SUPABASE_URL`

Example: `https://xyzabc.supabase.co`

**Anon Key:**
1. Same location: Settings → API
2. Look for **anon public** key (gray/public key)
3. Copy and paste into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6...`

**Service Role Key:**
1. Same location: Settings → API
2. Look for **Service role secret** (dark/private key)
3. Copy and paste into `SUPABASE_SERVICE_ROLE_KEY`
4. ⚠️ **Keep this secret! Don't share or commit to GitHub**

### 2. Resend (Email)

1. Go to [resend.com](https://resend.com)
2. Sign up (free tier available)
3. Click **API Keys** (left sidebar)
4. Click **Create API Key**
5. Give it a name: "Projectready4U"
6. Copy the key: `re_1234567890...`
7. Paste into `RESEND_API_KEY`

### 3. WhatsApp Number

Your WhatsApp phone number (with country code):
- India: `919876543210` (with 91 prefix)
- US: `14155552671` (with 1 prefix)
- Format: Country code + phone number (no +, spaces, or dashes)

### 4. Admin Email

The email where you want to receive:
- New project access requests
- Notifications about student signups
- Example: `admin@yourcompany.com`

### 5. Site URL

**Local:** `http://localhost:3000`

**Production:** `https://yoursite.com` (without trailing slash)

### 6. UPI ID (Optional)

If you want to accept payments in India:
- Get from your bank
- Format: `yourname@bankname` or `yourname@paytm`
- Example: `john@okhdfcbank`

---

## Production Deployment (Vercel)

⚠️ **Never put .env.local on GitHub!**

### Step 1: Add to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable:

```
Key                              Value
────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL        https://your.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY       eyJhbGc...
RESEND_API_KEY                  re_123...
NEXT_PUBLIC_WHATSAPP_NUMBER     919876543210
NEXT_PUBLIC_ADMIN_EMAIL         admin@yoursite.com
NEXT_PUBLIC_SITE_URL            https://yoursite.com
NEXT_PUBLIC_UPI_ID              yourname@paytm
```

5. Click **Save**

### Step 2: Update Supabase Auth URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   ```
   https://yoursite.com/admin/**
   https://yoursite.com/**
   ```
3. Save

---

## Which Variables Are Public?

**Public** (visible to browser, safe to expose):
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_WHATSAPP_NUMBER` ✅
- `NEXT_PUBLIC_ADMIN_EMAIL` ✅
- `NEXT_PUBLIC_SITE_URL` ✅
- `NEXT_PUBLIC_UPI_ID` ✅

**Private** (server-only, never expose):
- `SUPABASE_SERVICE_ROLE_KEY` 🔒
- `RESEND_API_KEY` 🔒

---

## Git Safety Checklist

```bash
# 1. Make sure .env.local is in .gitignore
cat .gitignore | grep "\.env"
# Should see: .env.local, .env*.local, .env.*.local

# 2. Make sure you haven't committed secrets
git log --all --source -S "SUPABASE_SERVICE_ROLE_KEY" -- .env*
# Should return nothing

# 3. Before pushing, verify no secrets in staged files
git diff --cached | grep -i "re_\|eyJhbGc"
# Should return nothing
```

---

## Troubleshooting

### "Can't connect to database"
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
- Check `.env.local` exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` is set
- Make sure there are no typos
- Restart dev server: `npm run dev`

### "Email not sending"
```
Error: RESEND_API_KEY not found
```
- Verify `RESEND_API_KEY` in `.env.local`
- Check key is correct (starts with `re_`)
- If using production, check Vercel Environment Variables

### "Build fails on Vercel"
```
Build Error: NEXT_PUBLIC_SUPABASE_URL is undefined
```
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Verify all 8 variables are added
- Check for typos
- Redeploy

### "Forms not submitting"
```
API route error: No credentials found
```
- Check both Supabase keys are in env
- Make sure to restart dev server after changing `.env.local`
- Verify Supabase project is active (not paused)

---

## How Variables Are Used

### In Components (Public Access)
```typescript
// Can use NEXT_PUBLIC_* in browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
```

### In API Routes (Private Access)
```typescript
// Can use private keys in server
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;
```

### In Server Components
```typescript
// Can access both in server components
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
```

---

## .env.example File

A `.env.example` file is included in the repo showing which variables are needed:

```bash
# 1. Copy it as template
cp .env.example .env.local

# 2. Fill in your actual values
nano .env.local

# 3. Never commit .env.local
git add .env.example  # Add template only
git add -u
git commit -m "Never commit .env.local"
```

---

## Security Best Practices

✅ **DO:**
- Use strong, unique values for keys
- Rotate keys regularly
- Use separate keys for dev/prod
- Store securely in Vercel (not in code)
- Use `.gitignore` to exclude `.env.local`

❌ **DON'T:**
- Share keys in Slack/Teams/Discord
- Commit `.env.local` to GitHub
- Use the same key for dev and prod
- Hardcode values in source files
- Share Vercel Environment Variables access

---

## Key Rotation

If you accidentally expose a key:

### For Supabase
1. Go to Settings → API → **Regenerate** (next to the key)
2. Update `.env.local` and Vercel
3. Redeploy

### For Resend
1. Go to API Keys
2. Delete the exposed key
3. Create new key
4. Update `.env.local` and Vercel
5. Redeploy

---

## Environment-Specific Values

### Local Development
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAIL=yourname+local@gmail.com
```

### Staging (Optional)
```env
NEXT_PUBLIC_SITE_URL=https://staging.yoursite.com
NEXT_PUBLIC_ADMIN_EMAIL=admin-staging@yoursite.com
```

### Production
```env
NEXT_PUBLIC_SITE_URL=https://yoursite.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@yoursite.com
```

---

## Quick Reference Table

| Variable | Type | Required | Where to Get | Example |
|----------|------|----------|--------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | String | Yes | Supabase Settings | https://xyz.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | String | Yes | Supabase API Keys | eyJhbGc... |
| SUPABASE_SERVICE_ROLE_KEY | String | Yes | Supabase API Keys | eyJhbGc... |
| RESEND_API_KEY | String | Yes | Resend Dashboard | re_1234... |
| NEXT_PUBLIC_WHATSAPP_NUMBER | String | Yes | Your number | 919876543210 |
| NEXT_PUBLIC_ADMIN_EMAIL | String | Yes | Your email | admin@site.com |
| NEXT_PUBLIC_SITE_URL | String | Yes | Your domain | https://site.com |
| NEXT_PUBLIC_UPI_ID | String | No | Your bank | name@paytm |

---

## Need More Help?

- Supabase Docs: https://supabase.com/docs
- Vercel Env Variables: https://vercel.com/docs/projects/environment-variables
- Resend Docs: https://resend.com/docs
- Next.js Env Vars: https://nextjs.org/docs/basic-features/environment-variables

---

**Last Updated:** 2024
