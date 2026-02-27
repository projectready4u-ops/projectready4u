# 🔧 Troubleshooting Guide

Common issues and their solutions.

---

## Development Issues

### "npm install fails"

**Error:**
```
npm ERR! 404 Not Found - GET https://registry.npmjs.org/...
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# If still failing, try:
npm install --legacy-peer-deps
```

---

### "Port 3000 already in use"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

Option 1: Kill the process
```bash
# On Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# On Mac/Linux
lsof -ti:3000 | xargs kill -9
```

Option 2: Use different port
```bash
npm run dev -- -p 3001
```

---

### "Can't connect to Supabase"

**Error:**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
Error: Cannot read property 'from' of undefined
```

**Checklist:**

- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- [ ] No typos in variable names
- [ ] Dev server restarted after changing `.env.local`
- [ ] Supabase project is active (not paused)

**Steps:**

1. Verify `.env.local`:
```bash
cat .env.local | grep SUPABASE_URL
```

2. Check it's valid:
```bash
# Should start with https://
# Should end with .supabase.co
```

3. Restart dev server:
```bash
npm run dev
```

4. Test Supabase connection:
```javascript
// Run in browser console
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('URL:', url);
console.log('Key exists:', !!key);
```

---

### "Build fails with TypeScript errors"

**Error:**
```
Type 'string | false' is not assignable to type 'string'
Cannot find module 'react'
```

**Solution:**

1. Clear build cache:
```bash
rm -rf .next
npm run build
```

2. Check TypeScript config:
```bash
cat tsconfig.json | grep -A 5 "compilerOptions"
```

3. Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Database Issues

### "Table doesn't exist"

**Error:**
```
relation "projects" does not exist
```

**Solution:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy the SQL from [DEPLOYMENT.md](DEPLOYMENT.md)
3. Paste and run each table creation
4. Verify tables exist: **Table Editor** → Should see `projects` and `requests`

---

### "RLS policies blocking reads"

**Error:**
```
new row violates row-level security policy
```

**Solution:**

1. Go to Supabase → **Authentication** → **Policies**
2. Check `projects` table has:
   - ✅ SELECT policy: "Allow public select" (no conditions)
3. Check `requests` table has:
   - ✅ INSERT policy: "Allow public insert" (no conditions)

---

### "Admin can't read requests"

**Error:**
```
Admin dashboard shows no requests
```

**Solution:**

1. Make sure you're logged in (cookie should exist)
2. Check RLS policy on `requests` table:
   ```sql
   CREATE POLICY "Allow admin read" ON requests
     FOR SELECT USING (auth.role() = 'authenticated');
   ```
3. Verify admin user exists in Supabase Auth

---

## Email Issues

### "Emails not sending"

**Error:**
```
Failed to send email
Invalid API key
```

**Checklist:**

- [ ] `RESEND_API_KEY` in `.env.local`
- [ ] Key starts with `re_`
- [ ] Key is not expired
- [ ] Admin email is in `NEXT_PUBLIC_ADMIN_EMAIL`

**Debug:**

1. Verify key in `.env.local`:
```bash
cat .env.local | grep RESEND_API_KEY
```

2. Test key with cURL:
```bash
curl -X POST https://api.resend.com/emails \
  -H 'Authorization: Bearer re_your_key' \
  -H 'Content-Type: application/json' \
  -d '{"from":"onboarding@resend.dev","to":"delivered@resend.dev","subject":"Test","html":"<p>Test</p>"}'
```

3. Check Resend dashboard for failed sends

---

### "Emails show wrong sender"

**Error:**
```
Email from: Projectready4U <noreply@resend.dev>
```

**Solution:**

1. Go to `src/lib/resend.ts`
2. Update sender email:
```typescript
from: 'noreply@yoursite.com'
```

3. For custom domain:
   - Add domain in Resend dashboard
   - Verify DNS records
   - Update sender email
   - Wait 24 hours for DNS propagation

---

## Admin Issues

### "Can't login to admin"

**Error:**
```
Redirects to /admin infinitely
No error message
```

**Checklist:**

- [ ] Admin user exists in Supabase Auth
- [ ] Email matches `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] Password is correct
- [ ] Browser cookies enabled
- [ ] Supabase auth configured

**Steps:**

1. Create admin user in Supabase:
   - Go to **Authentication** → **Users**
   - Click **Add User**
   - Enter email and password
   - Confirm email (verify)

2. Clear browser cookies:
   - Open DevTools → Application → Cookies
   - Delete all cookies for localhost:3000
   - Try login again

3. Check Supabase auth config:
   - Go to **Authentication** → **URL Configuration**
   - Add: `http://localhost:3000/admin/**`
   - Save

---

### "Admin dashboard shows no data"

**Error:**
```
Stats show 0
Charts are empty
```

**Solution:**

1. Create sample projects:
```sql
INSERT INTO projects (
  title, slug, category, description, abstract, synopsis,
  price, discounted_price, includes_source, includes_report
) VALUES (
  'Test Project', 'test-project', 'Web',
  'Test description', 'Test abstract', 'Test synopsis',
  5000, 2999, true, true
);
```

2. Create sample requests:
```sql
INSERT INTO requests (
  project_id, project_title, full_name, email, phone,
  college, city, state, status
) VALUES (
  (SELECT id FROM projects LIMIT 1),
  'Test Project',
  'Test User',
  'test@example.com',
  '9876543210',
  'Test College',
  'Test City',
  'Maharashtra',
  'pending'
);
```

3. Refresh dashboard page

---

### "Approve button not working"

**Error:**
```
Error: Request not found or already approved
```

**Solution:**

1. Make sure request is in `pending` status:
```sql
SELECT id, status FROM requests WHERE id = 'request-id';
```

2. Provide valid GitHub release URL:
```
https://github.com/username/repo/releases/download/v1.0/file.zip
```

3. Check API route logs for errors

---

## Form Issues

### "Form not submitting"

**Error:**
```
Submit button does nothing
No error shown
```

**Checklist:**

- [ ] All required fields filled
- [ ] Email format is valid
- [ ] Phone is exactly 10 digits
- [ ] Network is connected
- [ ] Dev server is running

**Debug in browser console:**

```javascript
// Check form data
const form = document.querySelector('form');
const data = new FormData(form);
console.log([...data.entries()]);

// Check if API is reachable
fetch('/api/requests')
  .then(r => r.status)
  .then(console.log)
  .catch(console.error);
```

---

### "Phone validation fails"

**Error:**
```
Phone must be exactly 10 digits
```

**Solution:**

1. Enter exactly 10 digits (no spaces, dashes, +)
2. Don't include country code (9876543210, not 919876543210)
3. Can start with any digit (not just 6, 7, 8, 9)

Valid examples:
- `9876543210` ✓
- `1234567890` ✓

Invalid:
- `98 7654 3210` ✗ (has spaces)
- `919876543210` ✗ (has country code)
- `987654321` ✗ (only 9 digits)

---

### "Rate limit error"

**Error:**
```
Too many requests. Maximum 3 requests per email per 24 hours
```

**Solution:**

1. This is intentional to prevent spam
2. Wait 24 hours or use different email
3. To reset in development:
```sql
DELETE FROM requests WHERE email = 'test@example.com' AND created_at > now() - interval '24 hours';
```

---

## Production Issues

### "Build fails on Vercel"

**Error:**
```
Build Error: NEXT_PUBLIC_SUPABASE_URL is undefined
```

**Solution:**

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add all 8 variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - RESEND_API_KEY
   - NEXT_PUBLIC_WHATSAPP_NUMBER
   - NEXT_PUBLIC_ADMIN_EMAIL
   - NEXT_PUBLIC_SITE_URL
   - NEXT_PUBLIC_UPI_ID

3. Redeploy

---

### "Emails not working in production"

**Solution:**

1. Verify Resend key is in Vercel env (not .env.local)
2. Check from email in `src/lib/resend.ts`
3. Add your domain to Resend dashboard
4. Update redirect URLs in Supabase:
   - `https://yoursite.com/admin/**`

---

### "Admin login doesn't work in production"

**Solution:**

1. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your domain
2. Add redirect URL in Supabase:
   - Go to **Authentication** → **URL Configuration**
   - Add: `https://yoursite.com/admin/**`
3. Clear browser cookies
4. Try login again

---

### "Static files not loading (404)"

**Error:**
```
Image/CSS/JS returns 404
```

**Solution:**

1. Make sure files are in `/public` folder
2. For images: use Next.js Image component
3. Check file path is correct
4. Rebuild: `npm run build && npm start`

---

## Performance Issues

### "Site is slow"

**Checklist:**

- [ ] Images are optimized (use Next.js Image)
- [ ] Database queries are efficient
- [ ] No N+1 queries
- [ ] Caching is enabled
- [ ] Code splitting is working

**Debug:**

```bash
# Check bundle size
npm run build

# Should see under 1MB for main bundle
```

---

### "Too many database queries"

**Solution:**

1. Fetch once and cache:
```typescript
// Bad: fetches in loop
projects.map(p => fetchProject(p.id))

// Good: fetch all at once
const projects = await fetchAllProjects()
```

2. Use pagination for large datasets
3. Add indexes for frequently queried columns

---

## Browser Issues

### "Page styles broken"

**Error:**
```
No colors, broken layout
```

**Solution:**

1. Clear browser cache:
   - DevTools → Application → Storage → Clear Site Data
2. Restart dev server
3. Check Tailwind CSS is building:
   ```bash
   npm run dev
   # Should show "✓ Ready in Xms"
   ```

---

### "Forms not working in Safari"

**Solution:**

- Add `autocomplete="off"` to inputs if needed
- Use standard HTML inputs (not custom)
- Test on Safari before deployment

---

## Getting Help

### Check These First

1. **Error message** - Copy exact error
2. **Browser console** - Check for red errors
3. **Terminal logs** - Check for dev server errors
4. **Network tab** - Check API responses
5. **Supabase logs** - Check database errors

### Where to Find Logs

**Development:**
```bash
# Terminal running "npm run dev"
# Shows all errors and logs
```

**Production:**

- Vercel Dashboard → **Logs** → **Runtime**
- Supabase Dashboard → **Logs** → **Edge Functions**
- Browser DevTools → **Console**

### Useful Commands for Debugging

```bash
# Check if build works
npm run build

# Run linter for errors
npm run lint

# Check dependencies
npm list

# Reinstall everything
rm -rf node_modules package-lock.json
npm install

# Test database connection
# In browser console:
fetch('/api/requests')
  .then(r => r.status)
  .then(console.log)
```

---

## Still Stuck?

1. Check the main [README.md](README.md)
2. Check [DEPLOYMENT.md](DEPLOYMENT.md)
3. Check [API_DOCS.md](API_DOCS.md)
4. Review [ENV_GUIDE.md](ENV_GUIDE.md)
5. Look at source code comments
6. Check error logs in Vercel/Supabase dashboards

---

**Last Updated:** 2024
