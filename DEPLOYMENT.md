// DEPLOYMENT & SETUP GUIDE
// Projectready4U - Full-Stack Academic Projects Platform

/**
 * ═══════════════════════════════════════════════════════════════
 * 📦 INSTALLATION & LOCAL DEVELOPMENT
 * ═══════════════════════════════════════════════════════════════
 */

// 1. Clone and install dependencies
// $ git clone <your-repo-url>
// $ cd projectready4u
// $ npm install

// 2. Create .env.local with actual credentials:
/*
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_1234567890
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_ADMIN_EMAIL=admin@yoursite.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_UPI_ID=yourname@paytm
*/

// 3. Run development server
// $ npm run dev
// Visit http://localhost:3000

/**
 * ═══════════════════════════════════════════════════════════════
 * 🗄️ SUPABASE DATABASE SETUP
 * ═══════════════════════════════════════════════════════════════
 */

// Execute this SQL in Supabase SQL Editor (Create each table):

// TABLE 1: Projects
/*
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

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public to read projects
CREATE POLICY "Allow public select" ON projects
  FOR SELECT USING (true);
*/

// TABLE 2: Requests
/*
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

-- Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (but not read without auth)
CREATE POLICY "Allow public insert" ON requests
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admin) to read/update
CREATE POLICY "Allow admin read" ON requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update" ON requests
  FOR UPDATE USING (auth.role() = 'authenticated');
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔐 SUPABASE AUTHENTICATION SETUP
 * ═══════════════════════════════════════════════════════════════
 */

// 1. Go to Supabase Dashboard > Authentication > Providers
// 2. Enable Email/Password
// 3. Create a test admin user:
//    - Email: admin@yoursite.com
//    - Password: (strong password)

// 4. Go to URL Configuration
// 5. Add your deployment URLs to Redirect URLs:
//    - http://localhost:3000/admin/**
//    - https://yoursite.com/admin/**

/**
 * ═══════════════════════════════════════════════════════════════
 * 💌 RESEND EMAIL SETUP
 * ═══════════════════════════════════════════════════════════════
 */

// 1. Sign up at https://resend.com
// 2. Get your API key from settings
// 3. Add to environment variables
// 4. Update sender email in /lib/resend.ts:
//    from: 'noreply@yoursite.com'
// 5. (Optional) Add your domain for branded emails

/**
 * ═══════════════════════════════════════════════════════════════
 * 🚀 VERCEL DEPLOYMENT
 * ═══════════════════════════════════════════════════════════════
 */

// Step 1: Push to GitHub
/*
$ git init
$ git add .
$ git commit -m "Initial commit: Academic Projectready4U Platform"
$ git branch -M main
$ git remote add origin https://github.com/yourusername/projectready4u.git
$ git push -u origin main
*/

// Step 2: Deploy on Vercel
// 1. Go to https://vercel.com/new
// 2. Select "Import Git Repository"
// 3. Paste your GitHub repo URL
// 4. Click Import
// 5. Add Environment Variables:
//    - NEXT_PUBLIC_SUPABASE_URL
//    - NEXT_PUBLIC_SUPABASE_ANON_KEY
//    - SUPABASE_SERVICE_ROLE_KEY
//    - RESEND_API_KEY
//    - NEXT_PUBLIC_WHATSAPP_NUMBER
//    - NEXT_PUBLIC_ADMIN_EMAIL
//    - NEXT_PUBLIC_SITE_URL=https://your-domain.com
//    - NEXT_PUBLIC_UPI_ID
// 6. Click "Deploy"

// Step 3: Update Supabase URL Configuration
// 1. Go to Supabase > Authentication > URL Configuration
// 2. Add your Vercel URL to Redirect URLs:
//    https://your-domain.com/admin/**

/**
 * ═══════════════════════════════════════════════════════════════
 * 📦 SAMPLE PROJECT DATA
 * ═══════════════════════════════════════════════════════════════
 */

// Insert test project via Supabase Dashboard > SQL Editor:
/*
INSERT INTO projects (
  title, slug, category, description, abstract, synopsis,
  price, discounted_price, youtube_link, github_repo_link,
  github_release_zip_url, includes_source, includes_report,
  includes_ppt, includes_synopsis, includes_viva, includes_readme
) VALUES (
  'Smart Attendance System',
  'smart-attendance-system',
  'Web',
  'Complete attendance tracking system with facial recognition',
  'A comprehensive web-based attendance system using facial recognition technology',
  'This project implements a smart attendance system that uses computer vision to recognize students and mark attendance automatically. Built with React, Node.js, and Python for ML.',
  5000,
  2999,
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://github.com/yourusername/smart-attendance',
  'https://github.com/yourusername/smart-attendance/releases/download/v1.0/smart-attendance.zip',
  true, true, true, true, true, true
);
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * ✅ PRODUCTION CHECKLIST
 * ═══════════════════════════════════════════════════════════════
 */

// Pre-Launch
// □ Update NEXT_PUBLIC_SITE_URL to your domain
// □ Update NEXT_PUBLIC_WHATSAPP_NUMBER
// □ Update NEXT_PUBLIC_ADMIN_EMAIL
// □ Configure custom domain in Vercel
// □ Set up SSL certificate (auto via Vercel)
// □ Test admin login in production
// □ Test form submission and emails
// □ Update README with your info

// Database
// □ Create all tables in Supabase
// □ Enable Row-Level Security (RLS)
// □ Add sample projects
// □ Create admin user account
// □ Test database connections
// □ Set up backups (Supabase dashboard)

// Email
// □ Verify Resend API key is working
// □ Test email delivery to admin
// □ Test email delivery to user
// □ Add domain to Resend (optional)
// □ Add unsubscribe links if needed

// Security
// □ All environment variables in Vercel (not hardcoded)
// □ CORS configured on Supabase
// □ RLS policies enabled
// □ Rate limiting tested
// □ Admin routes protected
// □ HTTPS everywhere
// □ No sensitive data in logs

// Performance
// □ Test mobile responsiveness
// □ Test on slow networks (DevTools throttling)
// □ Check Lighthouse score (aim for 90+)
// □ Test image optimization
// □ Test animation performance

// Analytics (Optional)
// □ Set up Vercel Analytics
// □ Set up Supabase logging
// □ Monitor error logs

/**
 * ═══════════════════════════════════════════════════════════════
 * 🐛 TROUBLESHOOTING
 * ═══════════════════════════════════════════════════════════════
 */

// "Can't connect to Supabase"
// → Check .env.local variables
// → Verify Supabase project URL and keys
// → Ensure tables exist in database
// → Check RLS policies

// "Email not sending"
// → Verify Resend API key in Vercel
// → Check admin email in Resend dashboard
// → Look at Resend logs for failures

// "Admin login redirects to /admin infinitely"
// → Clear browser cookies
// → Check Supabase auth user exists
// → Verify auth redirect URLs configured

// "Build fails on deployment"
// → Check all environment variables are set
// → Run `npm run build` locally to test
// → Check build logs in Vercel dashboard

/**
 * ═══════════════════════════════════════════════════════════════
 * 📚 FILE STRUCTURE REFERENCE
 * ═══════════════════════════════════════════════════════════════
 */

/*
projectready4u/
├── src/
│   ├── app/
│   │   ├── page.tsx                    (Home page)
│   │   ├── layout.tsx                  (Root layout with Toaster)
│   │   ├── projects/
│   │   │   ├── page.tsx               (Listing & filters)
│   │   │   └── [slug]/
│   │   │       └── page.tsx           (Detail page with SEO)
│   │   ├── admin/
│   │   │   ├── page.tsx               (Login page)
│   │   │   ├── dashboard/page.tsx     (Analytics dashboard)
│   │   │   ├── projects/page.tsx      (Project management)
│   │   │   └── requests/page.tsx      (Request management)
│   │   └── api/
│   │       ├── requests/route.ts      (Create request)
│   │       └── approve/route.ts       (Approve request)
│   ├── components/
│   │   ├── ui/                        (shadcn components)
│   │   ├── ProjectCard.tsx            (Project grid card)
│   │   ├── RequestModal.tsx           (Access request form)
│   │   ├── VideoModal.tsx             (YouTube player)
│   │   ├── AdminSidebar.tsx           (Admin navigation)
│   │   ├── FloatingWhatsApp.tsx       (Fixed button)
│   │   ├── StatsCard.tsx              (Dashboard stat card)
│   │   ├── TrafficBadge.tsx           (Source badge)
│   │   └── IncludesChecklist.tsx      (Features list)
│   ├── lib/
│   │   ├── supabase.ts               (Client & queries)
│   │   ├── resend.ts                 (Email templates)
│   │   └── utils.ts                  (Helpers & constants)
│   ├── types/
│   │   └── index.ts                  (TypeScript definitions)
│   └── middleware.ts                 (Admin route protection)
├── .env.local                         (Your env variables)
├── .env.example                       (Template)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── components.json                    (shadcn config)
└── README.md
*/

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔗 USEFUL LINKS
 * ═══════════════════════════════════════════════════════════════
 */

// Documentation
// Next.js: https://nextjs.org/docs
// Supabase: https://supabase.com/docs
// Tailwind: https://tailwindcss.com/docs
// shadcn/ui: https://ui.shadcn.com
// Framer Motion: https://www.framer.com/motion/
// Resend: https://resend.com/docs

// Deployment
// Vercel: https://vercel.com/docs
// GitHub: https://docs.github.com

// Tools
// Vercel Dashboard: https://vercel.com/dashboard
// Supabase Dashboard: https://app.supabase.com
// Resend Dashboard: https://app.resend.com

/**
 * ═══════════════════════════════════════════════════════════════
 * 💡 TIPS & BEST PRACTICES
 * ═══════════════════════════════════════════════════════════════
 */

// Development
// • Use `npm run dev` for local development
// • Keep .env.local with real credentials for testing
// • Test email with Resend's preview feature
// • Use Supabase dashboard for quick SQL queries

// Production
// • Never commit .env.local to git
// • Use Vercel environment variables only
// • Monitor Vercel analytics for traffic patterns
// • Set up error monitoring (Sentry, etc.)
// • Regular database backups

// Performance
// • Optimize images (use Next.js Image component)
// • Enable caching headers
// • Monitor Core Web Vitals
// • Use CDN for static assets

// Maintenance
// • Keep dependencies updated
// • Monitor error logs
// • Respond to support emails promptly
// • Track user feedback

export {};
