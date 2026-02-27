# 🎓 Project Marketplace - Full-Stack Academic Projects Platform

A modern, premium full-stack web application for buying and selling academic projects with professional source code, reports, PPT presentations, and more.

## 🌟 Features

### 🏠 Public Features
- **Home Page**: Hero section with animated gradient, featured projects, YouTube video showcase
- **Projects Listing**: Search, filter by category, price range sorting, responsive grid
- **Project Details**: Full SEO-optimized pages with YouTube embedded demos
- **Request Modal**: Validated form with WhatsApp sync, state selection, traffic tracking
- **Floating WhatsApp**: Quick contact button on every page
- **Smooth Animations**: Framer Motion animations throughout
- **Dark Theme**: Premium dark UI inspired by Vercel, Linear, Gumroad

### 🔐 Admin Features
- **Secure Login**: Supabase authentication
- **Dashboard**: Analytics cards, charts (Recharts), recent requests
- **Projects Management**: Add/edit/delete projects
- **Requests Management**: View, filter, approve/reject requests
- **Email Integration**: Admin notifications + approval emails via Resend

## 🛠 Tech Stack

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion

**Backend**: Supabase (PostgreSQL + Auth), Resend (Email), Next.js API Routes

**Deployment**: Vercel

## 🚀 Quick Start

### 1. Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_ADMIN_EMAIL=admin@yoursite.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_UPI_ID=your-upi@bank
```

### 2. Supabase Setup

Run in Supabase SQL Editor:
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

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  project_title TEXT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  college TEXT,
  city TEXT,
  state TEXT,
  traffic_source TEXT DEFAULT 'other',
  utm_source TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  access_link TEXT,
  requested_at TIMESTAMP DEFAULT now(),
  approved_at TIMESTAMP
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public insert requests" ON requests FOR INSERT WITH CHECK (true);
```

### 3. Run Locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

- Push to GitHub
- Import repo in Vercel
- Add environment variables
- Deploy!

## 📁 Project Structure

```
src/
├── app/page.tsx                    # Home
├── app/projects/page.tsx           # Browse projects
├── app/projects/[slug]/page.tsx    # Project detail
├── app/admin/page.tsx              # Admin login
├── app/admin/dashboard/page.tsx    # Admin dashboard
├── app/api/requests/route.ts       # Handle requests
├── components/                     # React components
├── lib/                           # Utilities & clients
└── types/index.ts                 # TypeScript definitions
```

## 🎨 Design

- **Background**: `#0a0a0a` with `#111111` cards
- **Accent**: Violet/Purple gradient (`#7c3aed` → `#4f46e5`)
- **Border radius**: 8px
- **Border style**: `border-white/10`
- **Font**: Inter

## 📊 Database Schema

**projects** table:
- Core fields: title, slug, category, description, abstract, synopsis
- Pricing: price, discounted_price
- Content: youtube_link, github_repo_link, github_release_zip_url, thumbnail_url
- Features: includes_source, includes_report, includes_ppt, includes_synopsis, includes_viva, includes_readme
- Metadata: created_at

**requests** table:
- Student info: full_name, email, phone, whatsapp_number
- Location: college, city, state
- Project: project_id, project_title
- Tracking: traffic_source, utm_source, message
- Status: status (pending|approved|rejected), approved_at, access_link
- Timeline: requested_at

## 🔒 Security

- Row-level security (RLS) on database tables
- Rate limiting: max 3 requests per email/24h
- Admin routes protected with middleware
- Server-side input validation
- Environment variables for sensitive data
- Supabase auth for admin access

## 📧 Email Templates

1. **Admin Notification**: New request details with WhatsApp/Dashboard links
2. **Student Approval**: Download button, setup instructions, support contact

## ✅ Feature Checklist

- [x] Modern dark theme UI
- [x] Home page with hero & stats
- [x] Projects listing with filters & search
- [x] Project detail pages with SEO
- [x] Request access modal
- [x] Admin dashboard
- [x] Email notifications
- [x] WhatsApp integration
- [x] Charts & analytics
- [x] Loading skeletons
- [x] Toast notifications
- [x] Animations
- [x] Mobile responsive
- [x] TypeScript throughout
- [x] Production-ready

## 🚢 Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Configure Supabase RLS policies
- [ ] Test admin login
- [ ] Test email sending (Resend)
- [ ] Update WhatsApp number
- [ ] Update site URL
- [ ] Add custom domain
- [ ] Set up error monitoring

## 📚 Documentation Files

- `.env.example` - Environment template
- `src/types/index.ts` - TypeScript definitions
- `src/lib/supabase.ts` - Supabase queries
- `src/lib/resend.ts` - Email templates
- `src/lib/utils.ts` - Helper functions

## 🐛 Common Issues

**Supabase connection failed**: Check `.env.local` variables

**Email not sending**: Verify Resend API key in Vercel secrets

**Admin login loop**: Clear cookies and verify Supabase auth user exists

## 💡 Tips

- Use `npm run dev` for development
- Check browser DevTools Network tab for API errors
- Use Supabase Dashboard for SQL debugging
- Monitor Resend dashboard for email delivery
- Use Vercel Analytics for traffic insights

## 📄 License

MIT - Free to use for commercial projects

---

**Production-ready. Fully featured. Ready to scale.**

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
