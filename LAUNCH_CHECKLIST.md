# ✅ Launch Checklist

Use this checklist to ensure everything is ready before launching to production.

---

## Pre-Launch (Before Coding)

- [ ] Domain registered and DNS configured
- [ ] Business requirements finalized
- [ ] Project pricing finalized
- [ ] GitHub repos created for sample projects
- [ ] Release ZIPs uploaded to GitHub releases

---

## Development Setup

### Repository
- [ ] Code pushed to GitHub (main branch)
- [ ] `.env.local` added to `.gitignore`
- [ ] No secrets committed
- [ ] README updated with your info
- [ ] License added (if needed)

### Dependencies
- [ ] `npm install` runs without errors
- [ ] All dev tools installed
- [ ] Node version 18+ installed
- [ ] TypeScript compiles without errors

### Environment Files
- [ ] `.env.local` created locally
- [ ] All 8 variables filled with real values
- [ ] `.env.example` updated (template only)

---

## Supabase Setup

### Project Creation
- [ ] Supabase project created
- [ ] Project URL copied
- [ ] Anon key copied
- [ ] Service role key copied

### Database
- [ ] `projects` table created
- [ ] `requests` table created
- [ ] RLS enabled on both tables
- [ ] Public SELECT policy on `projects`
- [ ] Public INSERT policy on `requests`
- [ ] Admin READ policy on `requests`
- [ ] Admin UPDATE policy on `requests`

### Sample Data
- [ ] At least 3 sample projects added
- [ ] Each project has:
  - [ ] Title and slug
  - [ ] Description and abstract
  - [ ] Price and discounted price
  - [ ] YouTube link
  - [ ] GitHub repo link
  - [ ] GitHub release ZIP URL
  - [ ] All "includes" flags set

### Authentication
- [ ] Admin user created
- [ ] Email matches `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] Password is strong
- [ ] Email verified
- [ ] Redirect URLs configured:
  - [ ] `http://localhost:3000/admin/**`

---

## Resend Email Setup

- [ ] Resend account created
- [ ] API key generated
- [ ] API key added to `.env.local`
- [ ] Test email sent successfully
- [ ] Sender email verified (if custom domain)
- [ ] Email templates reviewed:
  - [ ] Admin notification email
  - [ ] Student approval email

---

## Local Testing

### Homepage
- [ ] Page loads without errors
- [ ] All sections render correctly
- [ ] Navigation works
- [ ] Animations smooth
- [ ] Mobile responsive
- [ ] Dark theme applied

### Projects Listing
- [ ] All projects load
- [ ] Search works
- [ ] Filters work
- [ ] Sorting works
- [ ] Project cards display correctly
- [ ] Mobile responsive

### Project Detail Page
- [ ] YouTube video loads
- [ ] All project info displays
- [ ] SEO meta tags present
- [ ] Share buttons work
- [ ] Mobile responsive

### Request Form
- [ ] Form appears on detail page
- [ ] All fields present
- [ ] Validation works:
  - [ ] Email format
  - [ ] Phone exactly 10 digits
  - [ ] Required fields marked
- [ ] Submit works
- [ ] Success screen shows
- [ ] Form clears after submit
- [ ] Admin email received

### Admin Login
- [ ] Login page accessible at `/admin`
- [ ] Login with correct credentials works
- [ ] Redirects to dashboard after login
- [ ] Redirects to login if not authenticated
- [ ] Logout works
- [ ] Cookie persists across refreshes

### Admin Dashboard
- [ ] Stats cards show correct data
- [ ] Charts display correctly
- [ ] Recent requests table loads
- [ ] Data updates in real-time
- [ ] Mobile responsive

### Admin Management Pages
- [ ] Admin can navigate between pages
- [ ] All sidebar links work
- [ ] Mobile sidebar toggle works

---

## Build Verification

```bash
# Run these commands locally
```

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes (0 errors)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Build size reasonable (<5MB)

---

## Vercel Deployment

### Project Setup
- [ ] GitHub repo connected to Vercel
- [ ] Deploy from `main` branch
- [ ] Auto-deploy on push enabled

### Environment Variables
- [ ] All 8 variables added to Vercel:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] RESEND_API_KEY
  - [ ] NEXT_PUBLIC_WHATSAPP_NUMBER
  - [ ] NEXT_PUBLIC_ADMIN_EMAIL
  - [ ] NEXT_PUBLIC_SITE_URL (production domain)
  - [ ] NEXT_PUBLIC_UPI_ID

### Domain Setup
- [ ] Custom domain configured in Vercel
- [ ] SSL certificate auto-enabled
- [ ] DNS records pointing to Vercel

### First Deployment
- [ ] Initial build succeeds
- [ ] No build errors
- [ ] Site loads on Vercel URL
- [ ] Site loads on custom domain

---

## Post-Deployment Testing

### Production Site
- [ ] Homepage loads
- [ ] All pages accessible
- [ ] No 404 errors
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Dark theme applied

### Production Database
- [ ] Projects load from production DB
- [ ] Requests save to production DB
- [ ] Sample data visible

### Production Email
- [ ] Admin receives request emails
- [ ] Emails look correct
- [ ] Sender email correct
- [ ] Links in emails work

### Production Admin
- [ ] Admin login works with real credentials
- [ ] Dashboard loads data correctly
- [ ] Can approve requests
- [ ] Approval emails send correctly

### Form Submission
- [ ] Submit form on production
- [ ] Validation works
- [ ] Rate limiting works (try 4 requests)
- [ ] Success email received
- [ ] Admin receives notification email

---

## Security Checklist

- [ ] No secrets in code (grep for API keys)
- [ ] No secrets in git history
- [ ] CORS headers configured
- [ ] Rate limiting enabled
- [ ] RLS policies enforced
- [ ] HTTPS everywhere
- [ ] Environment variables in Vercel (not .env.local)
- [ ] `.env.local` in `.gitignore`
- [ ] Admin password strong
- [ ] No test users left in production
- [ ] No debugging logs in production

### Git Security
```bash
# Check no secrets committed
git log --all --source -S "SUPABASE_SERVICE_ROLE_KEY" -- .env*
git log --all --source -S "RESEND_API_KEY" -- .env*
# Should return nothing
```

---

## Performance Checklist

- [ ] Lighthouse score 90+
- [ ] Core Web Vitals green
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Images optimized
- [ ] No console errors on production
- [ ] API responses < 500ms
- [ ] Database queries efficient

### Test Tools
- Google PageSpeed: https://pagespeed.web.dev
- Lighthouse: DevTools → Lighthouse
- WebPageTest: https://www.webpagetest.org

---

## Monitoring Setup (Optional but Recommended)

- [ ] Vercel Analytics enabled
- [ ] Error tracking setup (Sentry/etc)
- [ ] Database backups configured
- [ ] Email delivery monitoring setup
- [ ] Uptime monitoring setup (Statuspage/etc)

---

## Documentation Review

- [ ] README.md updated with:
  - [ ] Your project description
  - [ ] Your contact info
  - [ ] Your domain
- [ ] QUICKSTART.md reviewed
- [ ] API_DOCS.md reviewed
- [ ] ENV_GUIDE.md reviewed
- [ ] TROUBLESHOOTING.md reviewed
- [ ] DEPLOYMENT.md reviewed

---

## Final Pre-Launch (24 Hours Before)

- [ ] Do full test run through entire user flow
- [ ] Test on different browsers
- [ ] Test on mobile (actual phone)
- [ ] Test on slow network (DevTools throttling)
- [ ] Backup database
- [ ] Have support email ready
- [ ] Prepare launch announcement
- [ ] Tell team to avoid changes 24 hours before

---

## Launch Day

- [ ] All tests passing
- [ ] No new errors
- [ ] Vercel build succeeds
- [ ] All features working
- [ ] Admin verified ready
- [ ] Email working
- [ ] Analytics tracking
- [ ] Go live! 🚀

---

## Post-Launch (First Week)

- [ ] Monitor Vercel logs for errors
- [ ] Monitor Supabase for issues
- [ ] Respond to user feedback
- [ ] Fix any critical bugs immediately
- [ ] Update docs based on user questions
- [ ] Plan next features
- [ ] Celebrate! 🎉

---

## Monthly Maintenance

- [ ] Review analytics
- [ ] Check error logs
- [ ] Update dependencies
- [ ] Backup database
- [ ] Review user feedback
- [ ] Plan improvements

---

## Signoff Template

When everything is complete, sign off:

```
✅ Projectready4U - Ready for Production

Launched: [DATE]
Domain: [YOUR DOMAIN]
Admin Email: [YOUR EMAIL]

Completed by: [YOUR NAME]
Date: [DATE]

All checklist items: ✅ PASSED
```

---

## Quick Reference

**Critical Path:**
1. Supabase setup (tables, auth, sample data)
2. Resend API key
3. Environment variables (.env.local)
4. `npm install` & `npm run build` success
5. Local testing complete
6. Vercel environment variables
7. Vercel deploy succeeds
8. Production testing complete
9. Launch! 🚀

**If anything fails:**
- Check TROUBLESHOOTING.md
- Review error messages carefully
- Check all environment variables
- Restart dev server
- Clear build cache: `rm -rf .next`

---

**Status:** Ready to use
**Last Updated:** 2024
