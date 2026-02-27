'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RequestModal } from '@/components/RequestModal';
import { IncludesChecklist } from '@/components/IncludesChecklist';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { VideoModal } from '@/components/VideoModal';
import { fetchProjectBySlug } from '@/lib/supabase';
import { Project } from '@/types';
import { formatPrice, getYouTubeVideoId, generateWhatsAppLink, copyToClipboard } from '@/lib/utils';
import { Github, Play, ExternalLink, Share2, Copy, CheckCircle, Loader2, ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      console.log('Loading project with slug:', slug);
      try {
        const data = await fetchProjectBySlug(slug);
        console.log('Fetched project:', data);
        if (!data) {
          console.error('Project not found for slug:', slug);
          toast.error('Project not found');
          return;
        }
        setProject(data);
      } catch (error) {
        console.error('Failed to load project:', error);
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [slug]);

  if (loading) {
    return (
      <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111] min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </main>
    );
  }

  if (!project) {
    return (
      <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111] min-h-screen flex items-center justify-center">
        <Card className="border border-white/10 bg-white/5 p-8 text-center max-w-md">
          <div className="text-5xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Not Found</h2>
          <p className="text-gray-400 mb-6">Sorry, we couldn't find that project.</p>
          <Link href="/projects">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              Browse All Projects
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  const videoId = getYouTubeVideoId(project.video_url);
  const price = Number(project.price) || 0;
  const discountedPrice = Number(project.discounted_price) || price;
  const discount = price > 0 ? Math.round(((price - discountedPrice) / price) * 100) : 0;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    if (await copyToClipboard(currentUrl)) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-white transition">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <Link href="/projects" className="text-gray-400 hover:text-white transition">
              Projects
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-500" />
            <span className="text-white font-medium truncate max-w-xs md:max-w-none">{project.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Video */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-violet-500/20 transition-all group">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => setShowVideo(true)}>
                  <Play className="w-4 h-4 mr-2" />
                  Full Screen
                </Button>
              </div>
            </div>

            {/* Header */}
            <div>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <Badge className="mb-3 bg-violet-600 hover:bg-violet-700">{project.category}</Badge>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">{project.title}</h1>
                </div>
                {discount > 0 && (
                  <div className="flex-shrink-0 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap">
                    -{discount}%
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-base sm:text-lg">{project.description}</p>
            </div>

            {/* Abstract & Synopsis */}
            <div className="space-y-4 md:space-y-6">
              {project.abstract && (
                <Card className="border border-white/10 bg-white/5 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Abstract</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{project.abstract}</p>
                </Card>
              )}

              {project.synopsis && (
                <Card className="border border-white/10 bg-white/5 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{project.synopsis}</p>
                </Card>
              )}
            </div>

            {/* Includes Checklist */}
            <div>
              <IncludesChecklist
                includes={{
                  source: project.includes_source,
                  report: project.includes_report,
                  ppt: project.includes_ppt,
                  synopsis: project.includes_synopsis,
                  viva: project.includes_viva,
                  readme: project.includes_readme,
                }}
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <Button
                onClick={() => setShowVideo(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Full Demo
              </Button>
            </div>

            {/* How to Get Section */}
            <Card className="border border-violet-500/50 bg-violet-500/5 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4">How to Get This Project</h3>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Fill the Request Form', desc: 'Click "Request Access" below' },
                  { num: 2, title: 'We Contact You', desc: 'Payment details on WhatsApp' },
                  { num: 3, title: 'Payment Confirmation', desc: 'Send ₹ via UPI' },
                  { num: 4, title: 'Get Download Link', desc: 'Instant download to your email' },
                ].map((step) => (
                  <div key={step.num} className="flex gap-3 sm:gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold">
                        {step.num}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-semibold text-sm sm:text-base">{step.title}</h4>
                      <p className="text-gray-400 text-xs sm:text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Pricing Card */}
            <Card className="border border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-indigo-500/10 p-4 sm:p-6 sticky top-4">
              <div className="mb-4 sm:mb-6">
                <p className="text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2 font-semibold">Original Price</p>
                <p className="text-gray-200 line-through text-base sm:text-lg font-bold">{formatPrice(price)}</p>
              </div>

              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
                <p className="text-gray-300 text-xs sm:text-sm mb-1 sm:mb-2 font-semibold">Limited Time Offer</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-300">{formatPrice(discountedPrice)}</p>
              </div>

              <Button
                onClick={() => setShowRequestModal(true)}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-10 sm:h-12 text-base sm:text-lg font-semibold mb-3 sm:mb-4"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Request Access
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const whatsappSettings = localStorage.getItem('adminSettings');
                    const settings = whatsappSettings ? JSON.parse(whatsappSettings) : {};
                    const businessPhone = settings.whatsapp_number || '919876543210';
                    window.open(generateWhatsAppLink(businessPhone, `Hi! I'm interested in ${project.title}`), '_blank');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopyLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                >
                  {copied ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </Card>

            {/* Stats */}
            <Card className="border border-white/10 bg-white/5 p-4 sm:p-6">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Category</p>
                  <p className="text-white font-semibold text-sm sm:text-base">{project.category}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">Added</p>
                  <p className="text-white font-semibold text-sm sm:text-base">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {showRequestModal && <RequestModal project={project} open={true} onOpenChange={setShowRequestModal} />}
      {showVideo && <VideoModal videoId={videoId} title={project.title} onClose={() => setShowVideo(false)} />}

      <FloatingWhatsApp />
    </main>
  );
}
