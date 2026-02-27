# 📖 Getting Started Guide

Visual step-by-step guide to launch your Projectready4U.

---

## 🎯 Your Journey

```
START
  ↓
[STEP 1] Get the Code
  ↓
[STEP 2] Setup Services
  ├─ Supabase (Database)
  ├─ Resend (Email)
  └─ Vercel (Hosting)
  ↓
[STEP 3] Configure
  └─ Environment Variables
  ↓
[STEP 4] Test Locally
  ├─ Homepage ✓
  ├─ Projects Listing ✓
  ├─ Project Detail ✓
  ├─ Request Form ✓
  └─ Admin Dashboard ✓
  ↓
[STEP 5] Deploy
  ├─ Push to GitHub
  ├─ Connect Vercel
  └─ Go Live!
  ↓
SUCCESS 🎉
```

---

## 📋 What You Need (5 minutes)

Before starting, you need:

```
☐ Computer with Terminal/PowerShell
☐ Code Editor (VS Code recommended)
☐ GitHub Account (free)
☐ Node.js 18+ installed
☐ npm or yarn
```

**Check what you have:**
```bash
node --version    # Should be 18 or higher
npm --version     # Should work
git --version     # Should work
```

If any fail, download:
- Node.js: https://nodejs.org/
- Git: https://git-scm.com/

---

## 🚀 Step 1: Get the Code (2 min)

### Option A: If You Have GitHub Repo

```bash
# 1. Open Terminal/PowerShell
# 2. Go to your workspace folder
cd "d:\OneDrive - WinWire\Desktop"

# 3. Clone the repo
git clone https://github.com/yourusername/projectready4u.git
cd projectready4u

# 4. Install dependencies
npm install

# 5. Wait for completion...
# You should see "added XXX packages"
```

### Option B: If You Got Code Differently

```bash
# 1. Open Terminal/PowerShell
# 2. Navigate to the project folder
cd "d:\OneDrive - WinWire\Desktop\Projectready4U"

# 3. Install dependencies
npm install

# 4. Wait for completion...
```

---

## 🔧 Step 2: Setup Services

You need 3 free services:

### 2A: Supabase (Database)

**What it is:** Cloud database for storing projects and requests

**Steps:**

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (easiest)
4. Create new organization (or use existing)
5. Create new project:
   - Name: `projectready4u`
   - Region: Closest to you
   - Password: Make it strong

6. Wait for project to be ready (~2 min)

7. Go to **Settings** → **API**

8. Copy these:
   ```
   Project URL: https://xyz.supabase.co
   Anon Key: eyJhbGc...
   ```

9. Copy this too (very important):
   ```
   Service Role Secret: eyJhbGc...
   (This is your private key! Don't share)
   ```

10. Go to **SQL Editor** (left sidebar)

11. Run this SQL (copy-paste entire block):
    ```sql
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT,
      description TEXT,
      abstract TEXT,
      synopsis TEXT,
      price NUMERIC,
      discounted_price NUMERIC,
      youtube_link TEXT,
      github_repo_link TEXT,
      github_release_zip_url TEXT,
      thumbnail_url TEXT,
      includes_source BOOLEAN DEFAULT false,
      includes_report BOOLEAN DEFAULT false,
      includes_ppt BOOLEAN DEFAULT false,
      includes_synopsis BOOLEAN DEFAULT false,
      includes_viva BOOLEAN DEFAULT false,
      includes_readme BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT now()
    );

    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public select" ON projects FOR SELECT USING (true);

    CREATE TABLE requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      project_title TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      whatsapp_number TEXT,
      college TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      traffic_source TEXT DEFAULT 'other',
      utm_source TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      access_link TEXT,
      requested_at TIMESTAMP DEFAULT now(),
      approved_at TIMESTAMP
    );

    ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow public insert" ON requests FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow admin read" ON requests FOR SELECT USING (auth.role() = 'authenticated');
    CREATE POLICY "Allow admin update" ON requests FOR UPDATE USING (auth.role() = 'authenticated');
    ```

12. Click **"Run"** and wait for success message ✓

13. Go to **Authentication** → **Users**

14. Click **"Add User"**
    - Email: `admin@yoursite.com`
    - Password: Something strong
    - Click "Send magic link to confirm" (don't check it)

✅ **Supabase done!**

---

### 2B: Resend (Email)

**What it is:** Service to send emails to students

**Steps:**

1. Go to https://resend.com
2. Click **"Sign up"**
3. Sign up with email (or GitHub)
4. Click **"API Keys"** (left sidebar)
5. Click **"Create API Key"**
6. Name it: `Project Marketplace`
7. Copy the key that starts with `re_`
   ```
   re_1234567890abcdef1234567890
   ```

✅ **Resend done!**

---

### 2C: GitHub (For Code Storage)

**What it is:** Version control and code hosting

**Steps:**

1. Go to https://github.com
2. Sign in or sign up
3. Create new repository:
   - Name: `projectready4u`
   - Private (recommended)
   - Don't add anything else
   - Click "Create repository"

4. Follow the instructions to push code:
   ```bash
   # In your project folder
   git config --global user.email "your@email.com"
   git config --global user.name "Your Name"
   
   git add .
   git commit -m "Initial commit: Projectready4U Platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/projectready4u.git
   git push -u origin main
   ```

✅ **GitHub done!**

---

## ⚙️ Step 3: Configure Environment

Environment variables are settings your app needs.

### 3A: Create .env.local

1. Open your project folder in VS Code
2. Create new file: `.env.local`
3. Copy this (replace `YOUR_` with actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...copy from Supabase API
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...copy from Supabase API
RESEND_API_KEY=re_...copy from Resend
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_ADMIN_EMAIL=admin@yoursite.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_UPI_ID=yourname@paytm
```

**Where to get each value:**

| Variable | From | How |
|----------|------|-----|
| NEXT_PUBLIC_SUPABASE_URL | Supabase | Settings → API → Copy URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase | Settings → API → Copy anon key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase | Settings → API → Copy service key |
| RESEND_API_KEY | Resend | API Keys → Copy your key |
| NEXT_PUBLIC_WHATSAPP_NUMBER | Your phone | Your WhatsApp number (10 digits) |
| NEXT_PUBLIC_ADMIN_EMAIL | You | Email where you'll receive requests |
| NEXT_PUBLIC_SITE_URL | localhost | Keep as is for local testing |
| NEXT_PUBLIC_UPI_ID | Your bank | Optional - your UPI ID |

4. Save the file (Ctrl+S)

✅ **Environment configured!**

---

## 🧪 Step 4: Test Locally

### 4A: Add Sample Data

In Supabase Dashboard → SQL Editor, run:

```sql
INSERT INTO projects (
  title, slug, category, description, abstract, synopsis,
  price, discounted_price, youtube_link, github_repo_link,
  github_release_zip_url, includes_source, includes_report,
  includes_ppt, includes_synopsis, includes_viva, includes_readme
) VALUES (
  'Smart Attendance System',
  'smart-attendance-system',
  'Web',
  'Web-based attendance system with facial recognition',
  'A complete system for automatic attendance marking',
  'This project uses OpenCV and Python for facial recognition. Includes React frontend and Node.js backend. Fully documented with setup guide.',
  5000,
  2999,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://github.com/yourusername/smart-attendance',
  'https://github.com/yourusername/smart-attendance/releases/download/v1.0/smart-attendance.zip',
  true, true, true, true, true, true
);
```

### 4B: Start Development Server

```bash
# In your project folder
npm run dev
```

You should see:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 4C: Test the App

Open http://localhost:3000 in your browser

**Test each page:**

- [ ] **Home** - Should load with hero, projects, stats
- [ ] **Projects** - Should show your sample project
- [ ] **Project Detail** - Click on project, should show full details
- [ ] **Request Form** - Click "Request Access", fill form, submit
- [ ] **Admin Login** - Go to /admin, login with your email
  - Email: `admin@yoursite.com`
  - Password: What you set in Supabase
- [ ] **Admin Dashboard** - Should show stats and requests

**Check email:**
- [ ] Admin should receive request notification email
- [ ] Subject: "New Project Access Request"
- [ ] Shows student details

✅ **Everything working locally!**

---

## 🌍 Step 5: Deploy to Vercel

**What is Vercel?** Free hosting service (owned by Next.js creators)

### 5A: Connect to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with GitHub
4. Authorize Vercel to access your GitHub
5. Go to Dashboard
6. Click **"New Project"**
7. Select your `projectready4u` repo
8. Click **"Import"**

### 5B: Add Environment Variables

1. In Vercel, you'll see "Environment Variables" section
2. Add these 8 variables (same values as .env.local):
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
   RESEND_API_KEY = re_...
   NEXT_PUBLIC_WHATSAPP_NUMBER = 919876543210
   NEXT_PUBLIC_ADMIN_EMAIL = admin@yoursite.com
   NEXT_PUBLIC_SITE_URL = https://your-vercel-url.vercel.app
   NEXT_PUBLIC_UPI_ID = yourname@paytm
   ```

3. Click **"Deploy"**

4. Wait for build to complete (~5 min)
   - Should see: "Congratulations, deployment successful!"

### 5C: Update Supabase Auth

1. Go to Supabase Dashboard
2. Click **Authentication** → **URL Configuration**
3. Add your Vercel URL to "Redirect URLs":
   ```
   https://your-vercel-url.vercel.app/admin/**
   ```
4. Save

### 5D: Test Production

1. Click the Vercel URL
2. Test all features same as local testing
3. Test admin login
4. Test form submission and email

✅ **Live on the internet!**

---

## 🎉 Success!

Your site is now live! Here's what you have:

| Feature | Status |
|---------|--------|
| Homepage | ✅ Live |
| Projects Listing | ✅ Live |
| Project Details | ✅ Live |
| Request Form | ✅ Live |
| Email Notifications | ✅ Live |
| Admin Dashboard | ✅ Live |
| Admin Login | ✅ Live |

---

## 📝 Next Steps

### Tomorrow
- [ ] Add more projects to your database
- [ ] Test approving requests in admin dashboard
- [ ] Share link with friends to test

### This Week
- [ ] Customize colors/fonts to match your brand
- [ ] Add your company logo
- [ ] Add real project data
- [ ] Set up GitHub releases with ZIP files

### This Month
- [ ] Get user feedback
- [ ] Fix any bugs
- [ ] Plan new features
- [ ] Maybe add payment support

---

## 📚 Full Documentation

Now that you're up and running, check out:

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Full project overview |
| [API_DOCS.md](API_DOCS.md) | API reference |
| [ENV_GUIDE.md](ENV_GUIDE.md) | Environment variables detail |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Detailed deployment guide |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Fix issues |
| [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | Pre-launch verification |

---

## 🆘 Something Wrong?

### Check These First

1. Is dev server running? `npm run dev`
2. Are environment variables set? Check `.env.local`
3. Can you reach Supabase? Check credentials
4. Did you restart server after .env.local changes? Restart `npm run dev`

### Common Errors

**"Can't connect to database"**
- Check `.env.local` has correct Supabase URL and keys
- Make sure Supabase project is active

**"Email not sending"**
- Check Resend API key in `.env.local`
- Check admin email in NEXT_PUBLIC_ADMIN_EMAIL

**"Admin login loops"**
- Clear browser cookies
- Make sure admin user exists in Supabase Auth
- Check `/admin/**` is in Supabase Redirect URLs

**More help:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🎯 Your Checklist

```
Step 1: Get Code
  ☐ Cloned repo or have project folder
  ☐ Ran npm install
  ☐ No errors

Step 2: Services
  ☐ Created Supabase project
  ☐ Created database tables
  ☐ Created admin user
  ☐ Got Resend API key
  ☐ Created GitHub repo

Step 3: Configuration
  ☐ Created .env.local
  ☐ Added all 8 variables
  ☐ No errors when saving

Step 4: Local Testing
  ☐ npm run dev works
  ☐ Can access http://localhost:3000
  ☐ Homepage loads
  ☐ Projects show
  ☐ Can submit form
  ☐ Can login to admin
  ☐ Emails arrive

Step 5: Deploy
  ☐ Pushed to GitHub
  ☐ Connected Vercel
  ☐ Set environment variables
  ☐ Deploy succeeded
  ☐ Site works on Vercel URL
  ☐ Updated Supabase redirect URLs

SUCCESS! 🚀
```

---

## 💡 Pro Tips

1. **Use VS Code Extensions:**
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - Supabase Docs (for reference)

2. **Test on Mobile:**
   - Use DevTools device emulation
   - Or share Vercel URL with phone
   - Test forms and navigation

3. **Monitor in Production:**
   - Check Vercel logs for errors
   - Check Supabase logs
   - Monitor email delivery

4. **Keep Code Safe:**
   - Don't commit `.env.local`
   - Don't share service keys
   - Use strong passwords

---

## 🤝 Getting Help

**Before asking for help, check:**

1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Your issue likely listed
2. [ENV_GUIDE.md](ENV_GUIDE.md) - If it's an environment issue
3. [API_DOCS.md](API_DOCS.md) - If it's an API issue
4. Code comments - Solutions often documented in code

---

## 🎓 Learning Resources

While using this project, learn about:

- **Next.js 14:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React:** https://react.dev
- **Vercel:** https://vercel.com/docs

---

## 🏁 You're All Set!

Welcome to Projectready4U! 🎉

You've successfully launched a production-ready web application with:
- Database (Supabase)
- Email (Resend)
- Hosting (Vercel)
- Modern UI (React + Tailwind)
- Admin Dashboard
- Analytics

**Now go build your business!** 💪

---

**Questions?** Check the docs above.  
**Stuck?** See TROUBLESHOOTING.md  
**Ready to customize?** Check README.md for architecture.

---

**Last Updated:** 2024  
**Status:** Ready for production
