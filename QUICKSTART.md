# 🚀 Quick Start Guide

## Get Running in 5 Minutes

### Prerequisites
- Node.js 18+
- npm or yarn
- GitHub account
- Code editor (VS Code recommended)

---

## Step 1: Clone & Install (2 min)

```bash
# Clone your repository
git clone <your-repo-url>
cd projectready4u

# Install dependencies
npm install
```

---

## Step 2: Get Your Credentials (2 min)

### Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy **Project URL** and **Anon Key**
4. Go to SQL Editor and paste:

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

5. Create admin user: **Authentication** → **Create User** → Add email & password

### Resend Setup
1. Go to [resend.com](https://resend.com)
2. Sign up free
3. Copy **API Key**

---

## Step 3: Configure Environment (1 min)

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-key
RESEND_API_KEY=re_1234567890
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_ADMIN_EMAIL=admin@yoursite.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_UPI_ID=yourname@paytm
```

---

## Step 4: Run Locally (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) ✨

---

## What You Get

✅ **Home Page**
- Hero section with gradient
- Featured projects grid
- YouTube showcase
- Stats cards
- CTA sections

✅ **Projects Listing** (`/projects`)
- Search by title
- Filter by category
- Sort by price/date
- Responsive grid

✅ **Project Details** (`/projects/[slug]`)
- Full project info
- YouTube embedded video
- Request access form
- Share buttons
- SEO optimized

✅ **Admin Dashboard** (`/admin`)
- Analytics charts
- Request management
- Project management
- Stats overview

---

## Add Sample Data

In Supabase Dashboard → SQL Editor:

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
  'Complete attendance tracking with facial recognition',
  'A web-based attendance system using facial recognition',
  'This project uses computer vision to recognize students and mark attendance automatically. Built with React, Node.js, and Python ML models.',
  5000,
  2999,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://github.com/yourusername/smart-attendance',
  'https://github.com/yourusername/smart-attendance/releases/download/v1.0/smart-attendance.zip',
  true, true, true, true, true, true
);
```

---

## Deploy to Vercel (Optional)

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push
```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add environment variables (same as `.env.local`)
5. Deploy! 🎉

---

## Troubleshooting

### "Can't connect to Supabase"
- Check `.env.local` has correct URL and keys
- Verify database tables exist
- Check Supabase project is active

### "Email not sending"
- Verify Resend API key is correct
- Check admin email address
- Look at Resend dashboard for errors

### "Admin login not working"
- Clear browser cookies
- Verify admin user exists in Supabase Auth
- Check `/admin/**` is in Supabase Redirect URLs

---

## Next Steps

1. **Customize Design**
   - Edit `src/app/globals.css` for colors
   - Update fonts in `src/app/layout.tsx`
   - Modify Tailwind config in `tailwind.config.ts`

2. **Add More Projects**
   - Use Supabase dashboard to insert
   - Or build admin UI for project creation

3. **Setup Email Domain**
   - Verify domain in Resend
   - Update `from` email in `src/lib/resend.ts`

4. **Add Payment** (Optional)
   - Integrate Razorpay/PhonePe for INR
   - Add payment button to request flow

---

## File Reference

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Home page |
| `src/app/projects/page.tsx` | Listings |
| `src/app/projects/[slug]/page.tsx` | Detail page |
| `src/app/admin/page.tsx` | Login |
| `src/app/admin/dashboard/page.tsx` | Dashboard |
| `src/lib/supabase.ts` | Database queries |
| `src/lib/resend.ts` | Email templates |
| `src/components/RequestModal.tsx` | Access form |

---

## Key Credentials to Keep Safe

🔐 **Never share these:**
- Supabase Service Role Key
- Resend API Key
- Admin password

✅ **Safe to share:**
- Supabase Project URL
- Supabase Anon Key
- GitHub repo (if public)

---

## Commands Reference

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Run production build
npm run lint     # Run ESLint
```

---

## Need Help?

Check the documentation files:
- `README.md` - Full project overview
- `DEPLOYMENT.md` - Detailed deployment guide

Or explore the code:
- All components are in `src/components/`
- All pages are in `src/app/`
- Database logic is in `src/lib/supabase.ts`
- Email templates are in `src/lib/resend.ts`

---

Happy coding! 🎉
