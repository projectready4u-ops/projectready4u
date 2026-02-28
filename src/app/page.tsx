'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProjectCard } from '@/components/ProjectCard';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { FeedbackForm } from '@/components/FeedbackForm';
import { FeedbackCarousel } from '@/components/FeedbackCarousel';
import { fetchFeaturedProjects, fetchCategories } from '@/lib/supabase';
import { Project, YouTubeVideo, Category } from '@/types';
import { MessageCircle, ArrowRight, Users, BookOpen, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const FEATURED_VIDEOS: YouTubeVideo[] = [];

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [approvedFeedbackCount, setApprovedFeedbackCount] = useState(0);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchFeaturedProjects(3);
        setProjects(data);
      } catch (error) {
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    const loadApprovedFeedback = async () => {
      try {
        const response = await fetch('/api/feedback?approved=true');
        if (response.ok) {
          const data = await response.json();
          setApprovedFeedbackCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to load feedback count', error);
      }
    };

    loadProjects();
    loadCategories();
    loadApprovedFeedback();
  }, []);

  const stats = [
    { icon: BookOpen, label: 'Projects Available', value: `${categories.reduce((sum, cat) => sum + cat.count, 0)}+` },
    { icon: Heart, label: 'Happy Customers', value: `${approvedFeedbackCount}+` },
    { icon: Users, label: 'Students Served', value: 'Growing' },
  ];

  return (
    <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111] min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Project Ready 4U"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent font-bold text-xl hidden sm:inline">
              Project Ready 4U
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Browse Projects
              </Button>
            </Link>
            <Button
              onClick={() => window.open(`https://wa.me/91${whatsappNumber}`, '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Us</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(124, 58, 237, 0.05) 25%, rgba(124, 58, 237, 0.05) 26%, transparent 27%, transparent 74%, rgba(124, 58, 237, 0.05) 75%, rgba(124, 58, 237, 0.05) 76%, transparent 77%, transparent),
                             linear-gradient(90deg, transparent 24%, rgba(124, 58, 237, 0.05) 25%, rgba(124, 58, 237, 0.05) 26%, transparent 27%, transparent 74%, rgba(124, 58, 237, 0.05) 75%, rgba(124, 58, 237, 0.05) 76%, transparent 77%, transparent)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-block px-4 py-2 rounded-full border border-violet-500/50 bg-violet-500/10 mb-6">
              <p className="text-sm text-violet-300">✨ Your trusted academic project partner</p>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Get Your Academic
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Projects Done Right
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Browse final year projects with full source code, report, PPT, synopsis and viva questions — ready to submit.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/projects">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold h-12 px-8 text-lg" size="lg">
                  Browse Projects <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                onClick={() => window.open(`https://wa.me/91${whatsappNumber}`, '_blank')}
                className="border border-white/40 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white font-semibold h-12 px-8 text-lg"
                size="lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat on WhatsApp
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="inline-block p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 mb-4">
                  <stat.icon className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Projects</h2>
            <p className="text-gray-400 text-lg">Hand-picked projects ready to submit</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video bg-gradient-to-br from-white/10 to-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border border-white/10 bg-white/5 p-12 text-center">
              <p className="text-gray-400">No projects available yet</p>
            </Card>
          )}

          <div className="text-center mt-12">
            <Link href="/projects" className="inline-block">
              <button
                style={{
                  background: 'white',
                  color: '#000000',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                View All Projects <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Explore Categories</h2>
            <p className="text-gray-400 text-lg">Browse projects by technology and domain</p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-gradient-to-br from-white/10 to-white/5 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, idx) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.6 }}
                >
                  <Link href={`/projects?category=${encodeURIComponent(category.name)}`}>
                    <Card className="group overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-500/50 transition-all cursor-pointer h-full p-6 flex flex-col items-center justify-center text-center hover:shadow-lg hover:shadow-violet-500/20">
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                      <h3 className="font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">{category.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                      <div className="mt-auto inline-block px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/50">
                        <span className="text-sm font-semibold text-violet-300">{category.count} projects</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border border-white/10 bg-white/5 p-12 text-center">
              <p className="text-gray-400">No categories available yet</p>
            </Card>
          )}
        </div>
      </section>

      {/* YouTube Videos Section - REMOVED - REPLACED WITH CUSTOMER FEEDBACK */}
      <section className="py-20 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Our Happy Customers Say</h2>
            <p className="text-gray-400 text-lg">Real feedback from students who used our projects successfully</p>
          </div>

          {/* Approved Feedback Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <FeedbackCarousel />
          </div>

          {/* Feedback Submission Form */}
          <Card className="border border-violet-500/50 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Share Your Experience</h3>
            <p className="text-gray-300 mb-6">Help other students by sharing your feedback. Your experience will be displayed after admin approval.</p>
            <FeedbackForm />
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border border-violet-500/50 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300 mb-8">
              Join thousands of students who have successfully submitted our projects
            </p>
            <Button
              onClick={() => window.open(`https://wa.me/91${whatsappNumber}`, '_blank')}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Get Help Now
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/[0.02] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                Project Marketplace
              </h3>
              <p className="text-gray-400 text-sm">
                Get high-quality academic projects with full source code and documentation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/projects" className="hover:text-white transition">Browse Projects</Link></li>
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href={`https://wa.me/91${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">WhatsApp</a></li>
                <li><a href="mailto:support@projectmarketplace.com" className="hover:text-white transition">Email</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Project Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </main>
  );
}
