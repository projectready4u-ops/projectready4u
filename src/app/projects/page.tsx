'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCard } from '@/components/ProjectCard';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { fetchAllProjects, fetchCategories } from '@/lib/supabase';
import { Project, Category } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';

function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceSort, setPriceSort] = useState('latest');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data - this runs once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, categoriesData] = await Promise.all([
          fetchAllProjects(),
          fetchCategories(),
        ]);
        setProjects(projectsData);
        setFilteredProjects(projectsData);
        setCategories(categoriesData);
        setIsInitialized(true);

        // Check for category in URL query params
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast.error('Failed to load projects');
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Empty dependency - run only once on mount

  // Handle category change from URL
  useEffect(() => {
    if (!isInitialized) return;
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, isInitialized]);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter - match exact category name from database
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort
    if (priceSort === 'price-low') {
      filtered = [...filtered].sort((a, b) => (a.discounted_price || a.price) - (b.discounted_price || b.price));
    } else if (priceSort === 'price-high') {
      filtered = [...filtered].sort((a, b) => (b.discounted_price || b.price) - (a.discounted_price || a.price));
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredProjects(filtered);
  }, [search, selectedCategory, priceSort, projects]);

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
              <Button variant="ghost" className="text-white hover:text-violet-400">
                Projects
              </Button>
            </Link>
            <Button
              onClick={() => {
                const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
                window.open(`https://wa.me/${phone}`, '_blank');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-white/10 sticky top-0 z-40 bg-gradient-to-b from-[#0a0a0a] to-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-white mb-4">All Projects</h1>
          <p className="text-gray-400">Browse our collection of ready-to-submit academic projects</p>
          {(search || selectedCategory !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-400">Active filters:</span>
              {search && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 border border-violet-500/50 rounded-full">
                  <span className="text-sm text-violet-300">Search: "{search}"</span>
                  <button
                    onClick={() => setSearch('')}
                    className="ml-1 hover:text-violet-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedCategory !== 'all' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/20 border border-violet-500/50 rounded-full">
                  <span className="text-sm text-violet-300">{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-violet-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="space-y-4">
            <Card className="border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </h3>

              {/* Search */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Search</label>
                <div className="relative">
                  <Input
                    placeholder="Project name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 pl-8"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-violet-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20 text-white">
                    <SelectItem value="all" className="text-white bg-gray-800 focus:bg-violet-600">
                      All Categories
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem 
                        key={cat.id} 
                        value={cat.name}
                        className="text-white bg-gray-800 focus:bg-violet-600"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-gray-400 block mb-2">Sort By</label>
                <Select value={priceSort} onValueChange={setPriceSort}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-violet-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-white/20 text-white">
                    <SelectItem value="latest" className="text-white bg-gray-800 focus:bg-violet-600">Latest</SelectItem>
                    <SelectItem value="price-low" className="text-white bg-gray-800 focus:bg-violet-600">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="text-white bg-gray-800 focus:bg-violet-600">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>

          {/* Projects Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-video bg-gradient-to-br from-white/10 to-white/5 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card className="border border-white/10 bg-white/5 p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <FloatingWhatsApp />
    </main>
  );
}
export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}